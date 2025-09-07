# Campus Event Management Platform - Design Document

## 1. Data to Track

### Event Creation Data

- Event ID (unique across colleges)
- Event name, description, type (Workshop/Fest/Seminar/Hackathon)
- College ID and college name
- Event date, time, duration
- Venue details
- Maximum capacity
- Created by (admin user)
- Creation timestamp

### Student Registration Data

- Registration ID
- Student ID and student details
- Event ID
- Registration timestamp
- Registration status (confirmed/waitlisted/cancelled)

### Attendance Data

- Attendance ID
- Student ID
- Event ID
- Check-in timestamp
- Attendance status (present/absent)

### Feedback Data

- Feedback ID
- Student ID
- Event ID
- Rating (1-5 scale)
- Comments (optional)
- Feedback timestamp

## 2. Database Schema

### Tables Structure

```sql
-- Colleges Table
CREATE TABLE colleges (
    college_id VARCHAR(10) PRIMARY KEY,
    college_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    contact_email VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
    event_id VARCHAR(20) PRIMARY KEY, -- Format: {college_id}-{sequence}
    college_id VARCHAR(10) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_description TEXT,
    event_type ENUM('Workshop', 'Fest', 'Seminar', 'Hackathon', 'Tech Talk') NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    duration_hours INT DEFAULT 2,
    venue VARCHAR(255),
    max_capacity INT DEFAULT 100,
    created_by VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    FOREIGN KEY (college_id) REFERENCES colleges(college_id)
);

-- Students Table
CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY,
    college_id VARCHAR(10) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15),
    year_of_study INT,
    department VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id)
);

-- Registrations Table
CREATE TABLE registrations (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) NOT NULL,
    event_id VARCHAR(20) NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'waitlisted', 'cancelled') DEFAULT 'confirmed',
    UNIQUE KEY unique_registration (student_id, event_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

-- Attendance Table
CREATE TABLE attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) NOT NULL,
    event_id VARCHAR(20) NOT NULL,
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('present', 'absent') DEFAULT 'present',
    UNIQUE KEY unique_attendance (student_id, event_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

-- Feedback Table
CREATE TABLE feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) NOT NULL,
    event_id VARCHAR(20) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_feedback (student_id, event_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);
```

## 3. API Design

### Base URL: `/api/v1`

### Authentication

- JWT tokens for admin authentication
- API keys for mobile app access

### Event Management Endpoints

#### Create Event

```
POST /events
Content-Type: application/json

{
    "college_id": "COLL001",
    "event_name": "React Workshop",
    "event_description": "Learn React fundamentals",
    "event_type": "Workshop",
    "event_date": "2025-10-15",
    "event_time": "10:00:00",
    "duration_hours": 4,
    "venue": "Lab 101",
    "max_capacity": 50
}
```

#### Get Events

```
GET /events?college_id=COLL001&type=Workshop&limit=10&offset=0
```

#### Update Event

```
PUT /events/{event_id}
```

#### Cancel Event

```
PATCH /events/{event_id}/cancel
```

### Student Registration Endpoints

#### Register for Event

```
POST /registrations
{
    "student_id": "COLL001-STU001",
    "event_id": "COLL001-EVT001"
}
```

#### Get Student Registrations

```
GET /students/{student_id}/registrations
```

#### Cancel Registration

```
DELETE /registrations/{registration_id}
```

### Attendance Endpoints

#### Mark Attendance

```
POST /attendance
{
    "student_id": "COLL001-STU001",
    "event_id": "COLL001-EVT001"
}
```

#### Get Event Attendance

```
GET /events/{event_id}/attendance
```

### Feedback Endpoints

#### Submit Feedback

```
POST /feedback
{
    "student_id": "COLL001-STU001",
    "event_id": "COLL001-EVT001",
    "rating": 4,
    "comments": "Great workshop!"
}
```

### Reporting Endpoints

#### Event Popularity Report

```
GET /reports/event-popularity?college_id=COLL001&limit=10
```

#### Student Participation Report

```
GET /reports/student-participation?student_id=COLL001-STU001
```

#### Top Active Students

```
GET /reports/top-students?college_id=COLL001&limit=3
```

#### Attendance Statistics

```
GET /reports/attendance-stats?event_id=COLL001-EVT001
```

## 4. Workflows

### Student Registration Workflow

```
Student opens app →
Browse events →
Select event →
Click register →
API validates capacity →
Registration confirmed/waitlisted →
Email notification sent
```

### Event Attendance Workflow

```
Student arrives at event →
Opens mobile app →
Scans QR code or manual check-in →
API marks attendance →
Real-time attendance count updated
```

### Report Generation Workflow

```
Admin logs in →
Selects report type →
Applies filters →
API processes query →
Data visualization rendered →
Export option available
```

## 5. Assumptions & Edge Cases

### Assumptions

- Each college has unique college_id
- Students belong to one college
- Events are college-specific
- Maximum 500 students per college
- 20 events per semester per college
- System supports ~50 colleges

### Edge Cases Handled

#### Duplicate Registrations

- Database constraint prevents duplicate registrations
- API returns appropriate error message
- Frontend shows already registered status

#### Event Capacity Overflow

- Registration automatically moves to waitlist when capacity reached
- Waitlisted students get notified when spots open up

#### Missing Feedback

- Reports handle null feedback gracefully
- Average calculations exclude missing feedback
- Prompts sent to encourage feedback submission

#### Cancelled Events

- All registrations automatically cancelled
- Notification sent to registered students
- Attendance marking disabled
- Reports exclude cancelled events by default

#### Late Arrivals

- Attendance can be marked within event duration + 30 minutes
- Late attendance flagged separately in reports

### Data Integrity

- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate entries
- Check constraints validate rating ranges
- Timestamps for audit trail

### Performance Considerations

- Indexes on frequently queried columns (college_id, event_date, student_id)
- Pagination for large result sets
- Caching for frequently accessed reports
- Database connection pooling

### Security Measures

- Input validation and sanitization
- SQL injection prevention using parameterized queries
- Rate limiting on API endpoints
- CORS configuration for web access
