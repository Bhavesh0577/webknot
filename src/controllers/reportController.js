const database = require('../models/database');

class ReportController {
    static async getEventPopularityReport(req, res) {
        try {
            const { college_id, limit = 10, event_type } = req.query;
            
            let sql = `
                SELECT 
                    e.event_id,
                    e.event_name,
                    e.event_type,
                    e.event_date,
                    e.venue,
                    COUNT(DISTINCT r.student_id) as total_registrations,
                    COUNT(DISTINCT a.student_id) as total_attendance,
                    ROUND(AVG(f.rating), 2) as average_rating,
                    COUNT(DISTINCT f.student_id) as feedback_count
                FROM events e
                LEFT JOIN registrations r ON e.event_id = r.event_id AND r.status = 'confirmed'
                LEFT JOIN attendance a ON e.event_id = a.event_id AND a.status = 'present'
                LEFT JOIN feedback f ON e.event_id = f.event_id
                WHERE e.status = 'active'
            `;
            
            const params = [];
            
            if (college_id) {
                sql += ' AND e.college_id = ?';
                params.push(college_id);
            }
            
            if (event_type) {
                sql += ' AND e.event_type = ?';
                params.push(event_type);
            }
            
            sql += `
                GROUP BY e.event_id
                ORDER BY total_registrations DESC, average_rating DESC
                LIMIT ?
            `;
            params.push(parseInt(limit));
            
            const events = await database.query(sql, params);
            
            res.json({
                success: true,
                data: events,
                filters: { college_id, event_type, limit }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getStudentParticipationReport(req, res) {
        try {
            const { student_id, college_id, limit = 10 } = req.query;
            
            if (student_id) {
                // Individual student report
                const sql = `
                    SELECT 
                        s.student_id,
                        s.student_name,
                        s.department,
                        s.year_of_study,
                        COUNT(DISTINCT r.event_id) as events_registered,
                        COUNT(DISTINCT a.event_id) as events_attended,
                        COUNT(DISTINCT f.event_id) as feedback_given,
                        ROUND(AVG(f.rating), 2) as average_rating_given,
                        ROUND(
                            (COUNT(DISTINCT a.event_id) * 100.0 / NULLIF(COUNT(DISTINCT r.event_id), 0)), 2
                        ) as attendance_percentage
                    FROM students s
                    LEFT JOIN registrations r ON s.student_id = r.student_id AND r.status = 'confirmed'
                    LEFT JOIN attendance a ON s.student_id = a.student_id AND a.status = 'present'
                    LEFT JOIN feedback f ON s.student_id = f.student_id
                    WHERE s.student_id = ?
                    GROUP BY s.student_id
                `;
                
                const result = await database.query(sql, [student_id]);
                
                if (result.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Student not found'
                    });
                }
                
                // Get detailed event participation
                const eventsSql = `
                    SELECT 
                        e.event_name,
                        e.event_date,
                        e.event_type,
                        r.registration_date,
                        CASE WHEN a.student_id IS NOT NULL THEN 'Yes' ELSE 'No' END as attended,
                        f.rating as feedback_rating
                    FROM registrations r
                    JOIN events e ON r.event_id = e.event_id
                    LEFT JOIN attendance a ON r.student_id = a.student_id AND r.event_id = a.event_id
                    LEFT JOIN feedback f ON r.student_id = f.student_id AND r.event_id = f.event_id
                    WHERE r.student_id = ? AND r.status = 'confirmed'
                    ORDER BY e.event_date DESC
                `;
                
                const events = await database.query(eventsSql, [student_id]);
                
                res.json({
                    success: true,
                    data: {
                        summary: result[0],
                        events: events
                    }
                });
            } else {
                // College-wide participation report
                let sql = `
                    SELECT 
                        s.student_id,
                        s.student_name,
                        s.department,
                        s.year_of_study,
                        COUNT(DISTINCT r.event_id) as events_registered,
                        COUNT(DISTINCT a.event_id) as events_attended,
                        COUNT(DISTINCT f.event_id) as feedback_given,
                        ROUND(AVG(f.rating), 2) as average_rating_given
                    FROM students s
                    LEFT JOIN registrations r ON s.student_id = r.student_id AND r.status = 'confirmed'
                    LEFT JOIN attendance a ON s.student_id = a.student_id AND a.status = 'present'
                    LEFT JOIN feedback f ON s.student_id = f.student_id
                `;
                
                const params = [];
                
                if (college_id) {
                    sql += ' WHERE s.college_id = ?';
                    params.push(college_id);
                }
                
                sql += `
                    GROUP BY s.student_id
                    HAVING events_registered > 0
                    ORDER BY events_attended DESC, events_registered DESC
                    LIMIT ?
                `;
                params.push(parseInt(limit));
                
                const students = await database.query(sql, params);
                
                res.json({
                    success: true,
                    data: students,
                    filters: { college_id, limit }
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getTopActiveStudents(req, res) {
        try {
            const { college_id, limit = 3 } = req.query;
            
            let sql = `
                SELECT 
                    s.student_id,
                    s.student_name,
                    s.department,
                    s.year_of_study,
                    COUNT(DISTINCT r.event_id) as events_registered,
                    COUNT(DISTINCT a.event_id) as events_attended,
                    COUNT(DISTINCT f.event_id) as feedback_given,
                    ROUND(AVG(f.rating), 2) as average_rating_given,
                    ROUND(
                        (COUNT(DISTINCT a.event_id) * 100.0 / NULLIF(COUNT(DISTINCT r.event_id), 0)), 2
                    ) as attendance_percentage,
                    -- Activity score: weighted combination of participation metrics
                    (
                        COUNT(DISTINCT a.event_id) * 3 +  -- Attendance weighted highest
                        COUNT(DISTINCT r.event_id) * 2 +  -- Registrations
                        COUNT(DISTINCT f.event_id) * 1    -- Feedback
                    ) as activity_score
                FROM students s
                LEFT JOIN registrations r ON s.student_id = r.student_id AND r.status = 'confirmed'
                LEFT JOIN attendance a ON s.student_id = a.student_id AND a.status = 'present'
                LEFT JOIN feedback f ON s.student_id = f.student_id
            `;
            
            const params = [];
            
            if (college_id) {
                sql += ' WHERE s.college_id = ?';
                params.push(college_id);
            }
            
            sql += `
                GROUP BY s.student_id
                HAVING events_registered > 0
                ORDER BY activity_score DESC, attendance_percentage DESC
                LIMIT ?
            `;
            params.push(parseInt(limit));
            
            const topStudents = await database.query(sql, params);
            
            res.json({
                success: true,
                data: topStudents,
                filters: { college_id, limit }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getAttendanceStats(req, res) {
        try {
            const { event_id, college_id } = req.query;
            
            if (event_id) {
                // Single event attendance stats
                const sql = `
                    SELECT 
                        e.event_name,
                        e.event_date,
                        e.event_type,
                        e.max_capacity,
                        COUNT(DISTINCT r.student_id) as total_registered,
                        COUNT(DISTINCT a.student_id) as total_attended,
                        (e.max_capacity - COUNT(DISTINCT r.student_id)) as remaining_capacity,
                        ROUND(
                            (COUNT(DISTINCT a.student_id) * 100.0 / NULLIF(COUNT(DISTINCT r.student_id), 0)), 2
                        ) as attendance_percentage
                    FROM events e
                    LEFT JOIN registrations r ON e.event_id = r.event_id AND r.status = 'confirmed'
                    LEFT JOIN attendance a ON e.event_id = a.event_id AND a.status = 'present'
                    WHERE e.event_id = ?
                    GROUP BY e.event_id
                `;
                
                const result = await database.query(sql, [event_id]);
                
                if (result.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Event not found'
                    });
                }
                
                res.json({
                    success: true,
                    data: result[0]
                });
            } else {
                // College-wide attendance summary
                let sql = `
                    SELECT 
                        e.event_type,
                        COUNT(DISTINCT e.event_id) as total_events,
                        COUNT(DISTINCT r.student_id) as total_registrations,
                        COUNT(DISTINCT a.student_id) as total_attendance,
                        ROUND(AVG(
                            (SELECT COUNT(*) FROM attendance a2 WHERE a2.event_id = e.event_id AND a2.status = 'present') * 100.0 /
                            NULLIF((SELECT COUNT(*) FROM registrations r2 WHERE r2.event_id = e.event_id AND r2.status = 'confirmed'), 0)
                        ), 2) as average_attendance_percentage
                    FROM events e
                    LEFT JOIN registrations r ON e.event_id = r.event_id AND r.status = 'confirmed'
                    LEFT JOIN attendance a ON e.event_id = a.event_id AND a.status = 'present'
                    WHERE e.status = 'active'
                `;
                
                const params = [];
                
                if (college_id) {
                    sql += ' AND e.college_id = ?';
                    params.push(college_id);
                }
                
                sql += `
                    GROUP BY e.event_type
                    ORDER BY average_attendance_percentage DESC
                `;
                
                const stats = await database.query(sql, params);
                
                res.json({
                    success: true,
                    data: stats,
                    filters: { college_id }
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getFeedbackReport(req, res) {
        try {
            const { college_id, event_type, min_rating = 1, max_rating = 5 } = req.query;
            
            let sql = `
                SELECT 
                    e.event_id,
                    e.event_name,
                    e.event_type,
                    e.event_date,
                    COUNT(f.feedback_id) as total_feedback,
                    ROUND(AVG(f.rating), 2) as average_rating,
                    MIN(f.rating) as min_rating,
                    MAX(f.rating) as max_rating,
                    SUM(CASE WHEN f.rating = 1 THEN 1 ELSE 0 END) as rating_1_count,
                    SUM(CASE WHEN f.rating = 2 THEN 1 ELSE 0 END) as rating_2_count,
                    SUM(CASE WHEN f.rating = 3 THEN 1 ELSE 0 END) as rating_3_count,
                    SUM(CASE WHEN f.rating = 4 THEN 1 ELSE 0 END) as rating_4_count,
                    SUM(CASE WHEN f.rating = 5 THEN 1 ELSE 0 END) as rating_5_count
                FROM events e
                LEFT JOIN feedback f ON e.event_id = f.event_id
                WHERE e.status = 'active'
            `;
            
            const params = [];
            
            if (college_id) {
                sql += ' AND e.college_id = ?';
                params.push(college_id);
            }
            
            if (event_type) {
                sql += ' AND e.event_type = ?';
                params.push(event_type);
            }
            
            sql += `
                GROUP BY e.event_id
                HAVING average_rating BETWEEN ? AND ?
                ORDER BY average_rating DESC, total_feedback DESC
            `;
            params.push(parseFloat(min_rating), parseFloat(max_rating));
            
            const feedbackReport = await database.query(sql, params);
            
            res.json({
                success: true,
                data: feedbackReport,
                filters: { college_id, event_type, min_rating, max_rating }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = ReportController;
