const database = require('./database');

class Event {
    static async create(eventData) {
        const {
            college_id,
            event_name,
            event_description,
            event_type,
            event_date,
            event_time,
            duration_hours,
            venue,
            max_capacity,
            created_by
        } = eventData;

        // Generate unique event ID
        const eventCount = await database.query(
            'SELECT COUNT(*) as count FROM events WHERE college_id = ?',
            [college_id]
        );
        const eventSequence = (eventCount[0].count + 1).toString().padStart(3, '0');
        const event_id = `${college_id}-EVT${eventSequence}`;

        const sql = `
            INSERT INTO events (
                event_id, college_id, event_name, event_description, event_type,
                event_date, event_time, duration_hours, venue, max_capacity, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await database.run(sql, [
            event_id, college_id, event_name, event_description, event_type,
            event_date, event_time, duration_hours, venue, max_capacity, created_by
        ]);

        return { event_id, ...eventData };
    }

    static async getAll(filters = {}) {
        let sql = 'SELECT * FROM events WHERE status = "active"';
        const params = [];

        if (filters.college_id) {
            sql += ' AND college_id = ?';
            params.push(filters.college_id);
        }

        if (filters.event_type) {
            sql += ' AND event_type = ?';
            params.push(filters.event_type);
        }

        if (filters.date_from) {
            sql += ' AND event_date >= ?';
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            sql += ' AND event_date <= ?';
            params.push(filters.date_to);
        }

        sql += ' ORDER BY event_date ASC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        if (filters.offset) {
            sql += ' OFFSET ?';
            params.push(filters.offset);
        }

        return await database.query(sql, params);
    }

    static async getById(event_id) {
        const sql = 'SELECT * FROM events WHERE event_id = ?';
        const result = await database.query(sql, [event_id]);
        return result[0];
    }

    static async update(event_id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(event_id);

        const sql = `UPDATE events SET ${fields} WHERE event_id = ?`;
        return await database.run(sql, values);
    }

    static async cancel(event_id) {
        const sql = 'UPDATE events SET status = "cancelled" WHERE event_id = ?';
        return await database.run(sql, [event_id]);
    }

    static async getRegistrationCount(event_id) {
        const sql = `
            SELECT COUNT(*) as count 
            FROM registrations 
            WHERE event_id = ? AND status = 'confirmed'
        `;
        const result = await database.query(sql, [event_id]);
        return result[0].count;
    }

    static async getAttendanceCount(event_id) {
        const sql = `
            SELECT COUNT(*) as count 
            FROM attendance 
            WHERE event_id = ? AND status = 'present'
        `;
        const result = await database.query(sql, [event_id]);
        return result[0].count;
    }

    static async getAverageFeedback(event_id) {
        const sql = `
            SELECT AVG(rating) as average_rating, COUNT(*) as feedback_count
            FROM feedback 
            WHERE event_id = ?
        `;
        const result = await database.query(sql, [event_id]);
        return {
            average_rating: result[0].average_rating || 0,
            feedback_count: result[0].feedback_count || 0
        };
    }
}

module.exports = Event;
