const database = require('./database');

class Attendance {
    static async markAttendance(student_id, event_id) {
        // Check if student is registered for the event
        const registration = await database.query(
            'SELECT * FROM registrations WHERE student_id = ? AND event_id = ? AND status = "confirmed"',
            [student_id, event_id]
        );

        if (registration.length === 0) {
            throw new Error('Student is not registered for this event or registration not confirmed');
        }

        // Check if attendance already marked
        const existingAttendance = await database.query(
            'SELECT * FROM attendance WHERE student_id = ? AND event_id = ?',
            [student_id, event_id]
        );

        if (existingAttendance.length > 0) {
            throw new Error('Attendance already marked for this student');
        }

        // Check if event is today or in the past (can't mark attendance for future events)
        const event = await database.query(
            'SELECT event_date FROM events WHERE event_id = ?',
            [event_id]
        );

        const eventDate = new Date(event[0].event_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate > today) {
            throw new Error('Cannot mark attendance for future events');
        }

        const sql = `
            INSERT INTO attendance (student_id, event_id)
            VALUES (?, ?)
        `;

        const result = await database.run(sql, [student_id, event_id]);

        return {
            attendance_id: result.id,
            student_id,
            event_id,
            check_in_time: new Date().toISOString(),
            status: 'present'
        };
    }

    static async getByEvent(event_id) {
        const sql = `
            SELECT a.*, s.student_name, s.email, s.department
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
            WHERE a.event_id = ?
            ORDER BY a.check_in_time ASC
        `;
        return await database.query(sql, [event_id]);
    }

    static async getByStudent(student_id) {
        const sql = `
            SELECT a.*, e.event_name, e.event_date, e.event_time, e.venue, e.event_type
            FROM attendance a
            JOIN events e ON a.event_id = e.event_id
            WHERE a.student_id = ? AND a.status = 'present'
            ORDER BY e.event_date DESC
        `;
        return await database.query(sql, [student_id]);
    }

    static async getAttendanceStats(event_id) {
        const sql = `
            SELECT 
                COUNT(DISTINCT r.student_id) as total_registered,
                COUNT(DISTINCT a.student_id) as total_attended
            FROM registrations r
            LEFT JOIN attendance a ON r.student_id = a.student_id AND r.event_id = a.event_id
            WHERE r.event_id = ? AND r.status = 'confirmed'
        `;
        const result = await database.query(sql, [event_id]);
        const stats = result[0];
        
        return {
            total_registered: stats.total_registered,
            total_attended: stats.total_attended,
            attendance_percentage: stats.total_registered > 0 
                ? ((stats.total_attended / stats.total_registered) * 100).toFixed(2)
                : 0
        };
    }

    static async getAbsentStudents(event_id) {
        const sql = `
            SELECT r.student_id, s.student_name, s.email
            FROM registrations r
            JOIN students s ON r.student_id = s.student_id
            LEFT JOIN attendance a ON r.student_id = a.student_id AND r.event_id = a.event_id
            WHERE r.event_id = ? AND r.status = 'confirmed' AND a.student_id IS NULL
        `;
        return await database.query(sql, [event_id]);
    }

    static async updateStatus(attendance_id, status) {
        const sql = 'UPDATE attendance SET status = ? WHERE attendance_id = ?';
        return await database.run(sql, [status, attendance_id]);
    }
}

module.exports = Attendance;
