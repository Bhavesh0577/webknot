const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            const dbPath = path.join(__dirname, '..', '..', 'database', 'campus_events.db');
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error connecting to database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.initializeTables().then(resolve).catch(reject);
                }
            });
        });
    }

    initializeTables() {
        return new Promise((resolve, reject) => {
            const tables = [
                // Colleges table
                `CREATE TABLE IF NOT EXISTS colleges (
                    college_id VARCHAR(10) PRIMARY KEY,
                    college_name VARCHAR(255) NOT NULL,
                    location VARCHAR(255),
                    contact_email VARCHAR(255),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,

                // Events table
                `CREATE TABLE IF NOT EXISTS events (
                    event_id VARCHAR(20) PRIMARY KEY,
                    college_id VARCHAR(10) NOT NULL,
                    event_name VARCHAR(255) NOT NULL,
                    event_description TEXT,
                    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('Workshop', 'Fest', 'Seminar', 'Hackathon', 'Tech Talk')),
                    event_date DATE NOT NULL,
                    event_time TIME NOT NULL,
                    duration_hours INTEGER DEFAULT 2,
                    venue VARCHAR(255),
                    max_capacity INTEGER DEFAULT 100,
                    created_by VARCHAR(255),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
                    FOREIGN KEY (college_id) REFERENCES colleges(college_id)
                )`,

                // Students table
                `CREATE TABLE IF NOT EXISTS students (
                    student_id VARCHAR(20) PRIMARY KEY,
                    college_id VARCHAR(10) NOT NULL,
                    student_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(15),
                    year_of_study INTEGER,
                    department VARCHAR(100),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (college_id) REFERENCES colleges(college_id)
                )`,

                // Registrations table
                `CREATE TABLE IF NOT EXISTS registrations (
                    registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id VARCHAR(20) NOT NULL,
                    event_id VARCHAR(20) NOT NULL,
                    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
                    UNIQUE(student_id, event_id),
                    FOREIGN KEY (student_id) REFERENCES students(student_id),
                    FOREIGN KEY (event_id) REFERENCES events(event_id)
                )`,

                // Attendance table
                `CREATE TABLE IF NOT EXISTS attendance (
                    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id VARCHAR(20) NOT NULL,
                    event_id VARCHAR(20) NOT NULL,
                    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent')),
                    UNIQUE(student_id, event_id),
                    FOREIGN KEY (student_id) REFERENCES students(student_id),
                    FOREIGN KEY (event_id) REFERENCES events(event_id)
                )`,

                // Feedback table
                `CREATE TABLE IF NOT EXISTS feedback (
                    feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id VARCHAR(20) NOT NULL,
                    event_id VARCHAR(20) NOT NULL,
                    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                    comments TEXT,
                    feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(student_id, event_id),
                    FOREIGN KEY (student_id) REFERENCES students(student_id),
                    FOREIGN KEY (event_id) REFERENCES events(event_id)
                )`
            ];

            let completed = 0;
            tables.forEach((sql, index) => {
                this.db.run(sql, (err) => {
                    if (err) {
                        console.error(`Error creating table ${index}:`, err);
                        reject(err);
                        return;
                    }
                    completed++;
                    if (completed === tables.length) {
                        console.log('All tables created successfully');
                        this.createIndexes().then(resolve).catch(reject);
                    }
                });
            });
        });
    }

    createIndexes() {
        return new Promise((resolve, reject) => {
            const indexes = [
                'CREATE INDEX IF NOT EXISTS idx_events_college_id ON events(college_id)',
                'CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date)',
                'CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type)',
                'CREATE INDEX IF NOT EXISTS idx_students_college_id ON students(college_id)',
                'CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON registrations(student_id)',
                'CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id)',
                'CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance(event_id)',
                'CREATE INDEX IF NOT EXISTS idx_feedback_event_id ON feedback(event_id)'
            ];

            let completed = 0;
            indexes.forEach((sql) => {
                this.db.run(sql, (err) => {
                    if (err) {
                        console.error('Error creating index:', err);
                        reject(err);
                        return;
                    }
                    completed++;
                    if (completed === indexes.length) {
                        console.log('All indexes created successfully');
                        resolve();
                    }
                });
            });
        });
    }

    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = new Database();
