const database = require('./database');

class Feedback {
    static async create(student_id, event_id, rating, comments = null) {
        // Check if student attended the event
        const attendance = await database.query(
            'SELECT * FROM attendance WHERE student_id = ? AND event_id = ? AND status = "present"',
            [student_id, event_id]
        );

        if (attendance.length === 0) {
            throw new Error('Only students who attended the event can provide feedback');
        }

        // Check if feedback already exists
        const existingFeedback = await database.query(
            'SELECT * FROM feedback WHERE student_id = ? AND event_id = ?',
            [student_id, event_id]
        );

        if (existingFeedback.length > 0) {
            throw new Error('Feedback already provided for this event');
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        const sql = `
            INSERT INTO feedback (student_id, event_id, rating, comments)
            VALUES (?, ?, ?, ?)
        `;

        const result = await database.run(sql, [student_id, event_id, rating, comments]);

        return {
            feedback_id: result.id,
            student_id,
            event_id,
            rating,
            comments,
            feedback_date: new Date().toISOString()
        };
    }

    static async getByEvent(event_id) {
        const sql = `
            SELECT f.*, s.student_name, s.department
            FROM feedback f
            JOIN students s ON f.student_id = s.student_id
            WHERE f.event_id = ?
            ORDER BY f.feedback_date DESC
        `;
        return await database.query(sql, [event_id]);
    }

    static async getByStudent(student_id) {
        const sql = `
            SELECT f.*, e.event_name, e.event_date, e.event_type
            FROM feedback f
            JOIN events e ON f.event_id = e.event_id
            WHERE f.student_id = ?
            ORDER BY f.feedback_date DESC
        `;
        return await database.query(sql, [student_id]);
    }

    static async getFeedbackStats(event_id) {
        const sql = `
            SELECT 
                COUNT(*) as total_feedback,
                AVG(rating) as average_rating,
                MIN(rating) as min_rating,
                MAX(rating) as max_rating,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5
            FROM feedback
            WHERE event_id = ?
        `;
        const result = await database.query(sql, [event_id]);
        const stats = result[0];

        return {
            total_feedback: stats.total_feedback,
            average_rating: stats.average_rating ? parseFloat(stats.average_rating).toFixed(2) : 0,
            min_rating: stats.min_rating || 0,
            max_rating: stats.max_rating || 0,
            rating_distribution: {
                1: stats.rating_1,
                2: stats.rating_2,
                3: stats.rating_3,
                4: stats.rating_4,
                5: stats.rating_5
            }
        };
    }

    static async update(feedback_id, rating, comments = null) {
        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        const sql = `
            UPDATE feedback 
            SET rating = ?, comments = ?, feedback_date = CURRENT_TIMESTAMP
            WHERE feedback_id = ?
        `;

        return await database.run(sql, [rating, comments, feedback_id]);
    }

    static async getAverageRatingByEventType(college_id = null) {
        let sql = `
            SELECT 
                e.event_type,
                AVG(f.rating) as average_rating,
                COUNT(f.feedback_id) as feedback_count
            FROM feedback f
            JOIN events e ON f.event_id = e.event_id
        `;
        const params = [];

        if (college_id) {
            sql += ' WHERE e.college_id = ?';
            params.push(college_id);
        }

        sql += ' GROUP BY e.event_type ORDER BY average_rating DESC';

        return await database.query(sql, params);
    }
}

module.exports = Feedback;
