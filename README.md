# Campus Event Management Platform

A comprehensive system for managing college events, student registrations, attendance tracking, and reporting. This platform provides both an admin portal for college staff and a student app interface for browsing and registering for events.

## 🚀 Features

### Admin Portal

- Create and manage events (workshops, seminars, hackathons, fests, tech talks)
- View student registrations and manage capacity
- Track attendance and generate reports
- Monitor feedback and ratings

### Student Features

- Browse available events by type, date, and college
- Register for events with automatic waitlist management
- Check-in for events (attendance tracking)
- Provide feedback and ratings
- View personal participation history

### Reporting System

- **Event Popularity Report**: Events sorted by registration count and ratings
- **Student Participation Report**: Individual and college-wide participation analytics
- **Top Active Students**: Identify most engaged students
- **Attendance Statistics**: Track attendance rates and patterns
- **Feedback Analysis**: Comprehensive feedback and rating reports

## 🏗️ Architecture

### Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite (easily scalable to PostgreSQL/MySQL)
- **API**: RESTful architecture
- **Documentation**: Comprehensive API documentation

### Database Schema

The system uses a normalized database schema with the following entities:

- **Colleges**: College information and management
- **Students**: Student profiles and academic details
- **Events**: Event details, scheduling, and capacity management
- **Registrations**: Student event registrations with status tracking
- **Attendance**: Event attendance records with timestamps
- **Feedback**: Student feedback and ratings for events

### Scale Assumptions

- ~50 colleges supported
- ~500 students per college
- ~20 events per semester per college
- Cross-college unique event IDs: `{college_id}-EVT{sequence}`

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## 🛠️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd webknot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database and sample data**

   ```bash
   npm run setup
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Access the API**
   - Health check: http://localhost:3000/health
   - API documentation: http://localhost:3000/api/v1
   - Base API URL: http://localhost:3000/api/v1

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

Currently using basic API structure. JWT authentication can be added for production use.

### Main Endpoints

#### Colleges

- `GET /colleges` - List all colleges
- `POST /colleges` - Create a new college
- `GET /colleges/{college_id}` - Get college details with stats
- `PUT /colleges/{college_id}` - Update college information

#### Events

- `GET /events` - List events with filters (college_id, event_type, date_range)
- `POST /events` - Create a new event
- `GET /events/{event_id}` - Get event details with statistics
- `PUT /events/{event_id}` - Update event
- `PATCH /events/{event_id}/cancel` - Cancel event
- `GET /events/{event_id}/registrations` - Get event registrations
- `GET /events/{event_id}/attendance` - Get event attendance
- `GET /events/{event_id}/feedback` - Get event feedback

#### Students

- `GET /students/college/{college_id}` - List students by college
- `POST /students` - Create a new student
- `GET /students/{student_id}` - Get student details with participation stats
- `PUT /students/{student_id}` - Update student information
- `GET /students/{student_id}/registrations` - Get student's registrations
- `GET /students/{student_id}/attendance` - Get student's attendance history
- `GET /students/{student_id}/feedback` - Get student's feedback history

#### Registration & Attendance

- `POST /students/register` - Register student for event
- `DELETE /students/registrations/{registration_id}` - Cancel registration
- `POST /students/attendance` - Mark student attendance
- `POST /students/feedback` - Submit event feedback

#### Reports

- `GET /reports/event-popularity` - Event popularity report
- `GET /reports/student-participation` - Student participation analysis
- `GET /reports/top-students` - Top 3 most active students
- `GET /reports/attendance-stats` - Attendance statistics
- `GET /reports/feedback` - Comprehensive feedback reports

### Sample API Calls

#### Create an Event

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "college_id": "MIT001",
    "event_name": "Advanced React Workshop",
    "event_description": "Deep dive into React hooks and performance optimization",
    "event_type": "Workshop",
    "event_date": "2025-12-01",
    "event_time": "14:00:00",
    "duration_hours": 3,
    "venue": "Computer Lab 201",
    "max_capacity": 25,
    "created_by": "Dr. Tech Expert"
  }'
```

#### Register Student for Event

```bash
curl -X POST http://localhost:3000/api/v1/students/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "MIT001-STU0001",
    "event_id": "MIT001-EVT001"
  }'
```

#### Get Event Popularity Report

```bash
curl "http://localhost:3000/api/v1/reports/event-popularity?college_id=MIT001&limit=5"
```

## 🧪 Sample Data

The system comes with comprehensive sample data including:

- 3 colleges (MIT, Stanford, CMU)
- 10 students across different colleges and departments
- 8 events of various types (workshops, seminars, hackathons, etc.)
- Multiple registrations, attendance records, and feedback entries

This data demonstrates all system features and provides a realistic testing environment.

## 📊 Key Reports

### 1. Event Popularity Report

Shows events ranked by:

- Total registrations
- Attendance count
- Average feedback rating
- Feedback participation

### 2. Student Participation Report

Individual student metrics:

- Events registered vs attended
- Attendance percentage
- Feedback participation
- Average rating given

### 3. Top Active Students

Identifies most engaged students using activity score:

- Attendance (weighted 3x)
- Registrations (weighted 2x)
- Feedback given (weighted 1x)

### 4. Attendance Analytics

- Event-wise attendance statistics
- College-wide attendance trends
- Event type performance analysis

## 🔧 Development Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run setup` - Initialize database and insert sample data

## 🚦 Testing the System

1. **Start the server**: `npm run dev`
2. **Check health**: Visit http://localhost:3000/health
3. **Explore API**: Visit http://localhost:3000/api/v1
4. **Test reports**:
   - http://localhost:3000/api/v1/reports/event-popularity
   - http://localhost:3000/api/v1/reports/top-students
5. **View sample data**:
   - http://localhost:3000/api/v1/colleges
   - http://localhost:3000/api/v1/events

## 🔄 Edge Cases Handled

- **Duplicate Registrations**: Database constraints prevent duplicates
- **Event Capacity Management**: Automatic waitlist when capacity exceeded
- **Missing Feedback**: Reports handle null values gracefully
- **Cancelled Events**: Proper status management and notifications
- **Late Attendance**: Time-based attendance validation
- **Data Integrity**: Foreign key constraints and validation

## 🏢 Production Considerations

### Security (for production deployment)

- Add JWT authentication
- Implement rate limiting
- Add input validation middleware
- Use environment variables for configuration
- Add API key management

### Scalability

- Database connection pooling
- Caching layer (Redis)
- Database migration to PostgreSQL
- Horizontal scaling with load balancers
- Microservices architecture for larger scale

### Monitoring

- Add logging middleware
- Performance monitoring
- Error tracking
- API usage analytics

## 📱 Frontend Integration

This backend is designed to support:

- **Admin Web Portal**: React/Vue.js dashboard for college staff
- **Student Mobile App**: React Native/Flutter app for students
- **Public Website**: Event browsing and information portal

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For questions and support:

- Check the API documentation at `/api/v1`
- Review the sample data and test endpoints
- Check the health endpoint for system status

---

**Built with ❤️ for the Campus Event Management Challenge**
