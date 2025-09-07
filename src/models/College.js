const database = require('./database');

class College {
    static async create(collegeData) {
        const { college_id, college_name, location, contact_email } = collegeData;

        const sql = `
            INSERT INTO colleges (college_id, college_name, location, contact_email)
            VALUES (?, ?, ?, ?)
        `;

        await database.run(sql, [college_id, college_name, location, contact_email]);
        return collegeData;
    }

    static async getAll() {
        const sql = 'SELECT * FROM colleges ORDER BY college_name ASC';
        return await database.query(sql);
    }

    static async getById(college_id) {
        const sql = 'SELECT * FROM colleges WHERE college_id = ?';
        const result = await database.query(sql, [college_id]);
        return result[0];
    }

    static async update(college_id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(college_id);

        const sql = `UPDATE colleges SET ${fields} WHERE college_id = ?`;
        return await database.run(sql, values);
    }

    static async getStats(college_id) {
        const sql = `
            SELECT 
                c.college_name,
                COUNT(DISTINCT e.event_id) as total_events,
                COUNT(DISTINCT s.student_id) as total_students,
                COUNT(DISTINCT r.registration_id) as total_registrations,
                COUNT(DISTINCT a.attendance_id) as total_attendance
            FROM colleges c
            LEFT JOIN events e ON c.college_id = e.college_id
            LEFT JOIN students s ON c.college_id = s.college_id
            LEFT JOIN registrations r ON e.event_id = r.event_id
            LEFT JOIN attendance a ON e.event_id = a.event_id
            WHERE c.college_id = ?
            GROUP BY c.college_id
        `;
        const result = await database.query(sql, [college_id]);
        return result[0];
    }
}

module.exports = College;
