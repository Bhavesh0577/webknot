const database = require('./database');

class Registration {
    static async create(student_id, event_id) {
        // Check if event exists and is active
        const event = await database.query(
            'SELECT * FROM events WHERE event_id = ? AND status = "active"',
            [event_id]
        );
        
        if (event.length === 0) {
            throw new Error('Event not found or not active');
        }

        // Check if student exists
        const student = await database.query(
            'SELECT * FROM students WHERE student_id = ?',
            [student_id]
        );
        
        if (student.length === 0) {
            throw new Error('Student not found');
        }

        // Check if already registered
        const existingRegistration = await database.query(
            'SELECT * FROM registrations WHERE student_id = ? AND event_id = ?',
            [student_id, event_id]
        );
        
        if (existingRegistration.length > 0) {
            throw new Error('Student already registered for this event');
        }

        // Check event capacity
        const registrationCount = await database.query(
            'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = "confirmed"',
            [event_id]
        );

        const status = registrationCount[0].count >= event[0].max_capacity ? 'waitlisted' : 'confirmed';

        const sql = `
            INSERT INTO registrations (student_id, event_id, status)
            VALUES (?, ?, ?)
        `;

        const result = await database.run(sql, [student_id, event_id, status]);
        
        return {
            registration_id: result.id,
            student_id,
            event_id,
            status,
            registration_date: new Date().toISOString()
        };
    }

    static async getById(registration_id) {
        const sql = `
            SELECT r.*, s.student_name, s.email, e.event_name, e.event_date
            FROM registrations r
            JOIN students s ON r.student_id = s.student_id
            JOIN events e ON r.event_id = e.event_id
            WHERE r.registration_id = ?
        `;
        const result = await database.query(sql, [registration_id]);
        return result[0];
    }

    static async getByEvent(event_id, status = null) {
        let sql = `
            SELECT r.*, s.student_name, s.email, s.phone, s.department
            FROM registrations r
            JOIN students s ON r.student_id = s.student_id
            WHERE r.event_id = ?
        `;
        const params = [event_id];

        if (status) {
            sql += ' AND r.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY r.registration_date ASC';

        return await database.query(sql, params);
    }

    static async getByStudent(student_id, status = null) {
        let sql = `
            SELECT r.*, e.event_name, e.event_date, e.event_time, e.venue, e.event_type
            FROM registrations r
            JOIN events e ON r.event_id = e.event_id
            WHERE r.student_id = ?
        `;
        const params = [student_id];

        if (status) {
            sql += ' AND r.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY e.event_date DESC';

        return await database.query(sql, params);
    }

    static async updateStatus(registration_id, status) {
        const sql = 'UPDATE registrations SET status = ? WHERE registration_id = ?';
        return await database.run(sql, [status, registration_id]);
    }

    static async cancel(registration_id) {
        // First get the registration details
        const registration = await this.getById(registration_id);
        if (!registration) {
            throw new Error('Registration not found');
        }

        // Cancel the registration
        await this.updateStatus(registration_id, 'cancelled');

        // If it was confirmed, check if we can promote a waitlisted student
        if (registration.status === 'confirmed') {
            const waitlisted = await database.query(
                'SELECT * FROM registrations WHERE event_id = ? AND status = "waitlisted" ORDER BY registration_date ASC LIMIT 1',
                [registration.event_id]
            );

            if (waitlisted.length > 0) {
                await this.updateStatus(waitlisted[0].registration_id, 'confirmed');
                return {
                    cancelled: registration_id,
                    promoted: waitlisted[0].registration_id
                };
            }
        }

        return { cancelled: registration_id };
    }

    static async getEventStats(event_id) {
        const sql = `
            SELECT 
                status,
                COUNT(*) as count
            FROM registrations
            WHERE event_id = ?
            GROUP BY status
        `;
        const result = await database.query(sql, [event_id]);
        
        const stats = {
            confirmed: 0,
            waitlisted: 0,
            cancelled: 0
        };

        result.forEach(row => {
            stats[row.status] = row.count;
        });

        return stats;
    }
}

module.exports = Registration;
