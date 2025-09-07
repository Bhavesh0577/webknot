const database = require('./database');

class Student {
    static async create(studentData) {
        const {
            college_id,
            student_name,
            email,
            phone,
            year_of_study,
            department
        } = studentData;

        // Generate unique student ID
        const studentCount = await database.query(
            'SELECT COUNT(*) as count FROM students WHERE college_id = ?',
            [college_id]
        );
        const studentSequence = (studentCount[0].count + 1).toString().padStart(4, '0');
        const student_id = `${college_id}-STU${studentSequence}`;

        const sql = `
            INSERT INTO students (
                student_id, college_id, student_name, email, phone, year_of_study, department
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await database.run(sql, [
            student_id, college_id, student_name, email, phone, year_of_study, department
        ]);

        return { student_id, ...studentData };
    }

    static async getById(student_id) {
        const sql = 'SELECT * FROM students WHERE student_id = ?';
        const result = await database.query(sql, [student_id]);
        return result[0];
    }

    static async getByEmail(email) {
        const sql = 'SELECT * FROM students WHERE email = ?';
        const result = await database.query(sql, [email]);
        return result[0];
    }

    static async getByCollege(college_id, filters = {}) {
        let sql = 'SELECT * FROM students WHERE college_id = ?';
        const params = [college_id];

        if (filters.department) {
            sql += ' AND department = ?';
            params.push(filters.department);
        }

        if (filters.year_of_study) {
            sql += ' AND year_of_study = ?';
            params.push(filters.year_of_study);
        }

        sql += ' ORDER BY student_name ASC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        return await database.query(sql, params);
    }

    static async getAll(filters = {}) {
        let sql = 'SELECT s.*, c.college_name FROM students s JOIN colleges c ON s.college_id = c.college_id WHERE 1=1';
        const params = [];

        if (filters.department) {
            sql += ' AND s.department = ?';
            params.push(filters.department);
        }

        if (filters.year_of_study) {
            sql += ' AND s.year_of_study = ?';
            params.push(filters.year_of_study);
        }

        if (filters.college_id) {
            sql += ' AND s.college_id = ?';
            params.push(filters.college_id);
        }

        sql += ' ORDER BY s.student_name ASC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        return await database.query(sql, params);
    }

    static async update(student_id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(student_id);

        const sql = `UPDATE students SET ${fields} WHERE student_id = ?`;
        return await database.run(sql, values);
    }

    static async getRegistrations(student_id) {
        const sql = `
            SELECT r.*, e.event_name, e.event_date, e.event_time, e.venue, e.event_type
            FROM registrations r
            JOIN events e ON r.event_id = e.event_id
            WHERE r.student_id = ?
            ORDER BY e.event_date DESC
        `;
        return await database.query(sql, [student_id]);
    }

    static async getAttendedEvents(student_id) {
        const sql = `
            SELECT a.*, e.event_name, e.event_date, e.event_time, e.venue, e.event_type
            FROM attendance a
            JOIN events e ON a.event_id = e.event_id
            WHERE a.student_id = ? AND a.status = 'present'
            ORDER BY e.event_date DESC
        `;
        return await database.query(sql, [student_id]);
    }

    static async getParticipationStats(student_id) {
        const sql = `
            SELECT 
                COUNT(DISTINCT r.event_id) as total_registrations,
                COUNT(DISTINCT a.event_id) as total_attended,
                COUNT(DISTINCT f.event_id) as total_feedback_given,
                AVG(f.rating) as average_rating_given
            FROM students s
            LEFT JOIN registrations r ON s.student_id = r.student_id AND r.status = 'confirmed'
            LEFT JOIN attendance a ON s.student_id = a.student_id AND a.status = 'present'
            LEFT JOIN feedback f ON s.student_id = f.student_id
            WHERE s.student_id = ?
        `;
        const result = await database.query(sql, [student_id]);
        return result[0];
    }
}

module.exports = Student;
