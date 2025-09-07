const database = require('../src/models/database');
const College = require('../src/models/College');
const Student = require('../src/models/Student');
const Event = require('../src/models/Event');
const Registration = require('../src/models/Registration');
const Attendance = require('../src/models/Attendance');
const Feedback = require('../src/models/Feedback');

async function insertSampleData() {
    try {
        console.log('🌱 Starting sample data insertion...');
        
        // Connect to database
        await database.connect();
        
        // Sample Colleges
        const colleges = [
            {
                college_id: 'MIT001',
                college_name: 'Massachusetts Institute of Technology',
                location: 'Cambridge, MA',
                contact_email: 'events@mit.edu'
            },
            {
                college_id: 'STAN01',
                college_name: 'Stanford University',
                location: 'Stanford, CA',
                contact_email: 'events@stanford.edu'
            },
            {
                college_id: 'CMU001',
                college_name: 'Carnegie Mellon University',
                location: 'Pittsburgh, PA',
                contact_email: 'events@cmu.edu'
            }
        ];

        console.log('📚 Creating colleges...');
        for (const college of colleges) {
            await College.create(college);
        }
        console.log(`✅ Created ${colleges.length} colleges`);

        // Sample Students
        const students = [
            // MIT Students
            {
                college_id: 'MIT001',
                student_name: 'Alice Johnson',
                email: 'alice.johnson@mit.edu',
                phone: '+1-617-555-0001',
                year_of_study: 3,
                department: 'Computer Science'
            },
            {
                college_id: 'MIT001',
                student_name: 'Bob Smith',
                email: 'bob.smith@mit.edu',
                phone: '+1-617-555-0002',
                year_of_study: 2,
                department: 'Electrical Engineering'
            },
            {
                college_id: 'MIT001',
                student_name: 'Carol Davis',
                email: 'carol.davis@mit.edu',
                phone: '+1-617-555-0003',
                year_of_study: 4,
                department: 'Computer Science'
            },
            {
                college_id: 'MIT001',
                student_name: 'David Wilson',
                email: 'david.wilson@mit.edu',
                phone: '+1-617-555-0004',
                year_of_study: 1,
                department: 'Data Science'
            },
            {
                college_id: 'MIT001',
                student_name: 'Eva Brown',
                email: 'eva.brown@mit.edu',
                phone: '+1-617-555-0005',
                year_of_study: 3,
                department: 'Computer Science'
            },
            // Stanford Students
            {
                college_id: 'STAN01',
                student_name: 'Frank Miller',
                email: 'frank.miller@stanford.edu',
                phone: '+1-650-555-0001',
                year_of_study: 2,
                department: 'Computer Science'
            },
            {
                college_id: 'STAN01',
                student_name: 'Grace Lee',
                email: 'grace.lee@stanford.edu',
                phone: '+1-650-555-0002',
                year_of_study: 4,
                department: 'AI/ML'
            },
            {
                college_id: 'STAN01',
                student_name: 'Henry Chen',
                email: 'henry.chen@stanford.edu',
                phone: '+1-650-555-0003',
                year_of_study: 3,
                department: 'Computer Science'
            },
            // CMU Students
            {
                college_id: 'CMU001',
                student_name: 'Ivy Taylor',
                email: 'ivy.taylor@cmu.edu',
                phone: '+1-412-555-0001',
                year_of_study: 2,
                department: 'Software Engineering'
            },
            {
                college_id: 'CMU001',
                student_name: 'Jack Anderson',
                email: 'jack.anderson@cmu.edu',
                phone: '+1-412-555-0002',
                year_of_study: 3,
                department: 'Computer Science'
            }
        ];

        console.log('👥 Creating students...');
        const createdStudents = [];
        for (const student of students) {
            const created = await Student.create(student);
            createdStudents.push(created);
        }
        console.log(`✅ Created ${createdStudents.length} students`);

        // Sample Events
        const events = [
            // MIT Events (some past events for demo)
            {
                college_id: 'MIT001',
                event_name: 'React Workshop',
                event_description: 'Learn the fundamentals of React.js and build your first web application',
                event_type: 'Workshop',
                event_date: '2025-09-01', // Past event
                event_time: '10:00:00',
                duration_hours: 4,
                venue: 'Computer Lab 101',
                max_capacity: 30,
                created_by: 'Dr. Sarah Wilson'
            },
            {
                college_id: 'MIT001',
                event_name: 'AI Ethics Seminar',
                event_description: 'Discussing the ethical implications of artificial intelligence',
                event_type: 'Seminar',
                event_date: '2025-09-05', // Past event
                event_time: '14:00:00',
                duration_hours: 2,
                venue: 'Auditorium A',
                max_capacity: 100,
                created_by: 'Prof. Michael Brown'
            },
            {
                college_id: 'MIT001',
                event_name: 'TechFest 2025',
                event_description: 'Annual technology festival with competitions and exhibitions',
                event_type: 'Fest',
                event_date: '2025-11-05', // Future event
                event_time: '09:00:00',
                duration_hours: 8,
                venue: 'Main Campus',
                max_capacity: 500,
                created_by: 'Event Committee'
            },
            {
                college_id: 'MIT001',
                event_name: 'Startup Pitch Competition',
                event_description: 'Students present their startup ideas to industry experts',
                event_type: 'Hackathon',
                event_date: '2025-11-15', // Future event
                event_time: '09:00:00',
                duration_hours: 12,
                venue: 'Innovation Hub',
                max_capacity: 50,
                created_by: 'Entrepreneurship Club'
            },
            // Stanford Events
            {
                college_id: 'STAN01',
                event_name: 'Machine Learning Bootcamp',
                event_description: 'Intensive bootcamp covering ML algorithms and practical applications',
                event_type: 'Workshop',
                event_date: '2025-09-10', // Past event
                event_time: '09:00:00',
                duration_hours: 6,
                venue: 'AI Lab',
                max_capacity: 25,
                created_by: 'Dr. Andrew Ng'
            },
            {
                college_id: 'STAN01',
                event_name: 'Tech Industry Panel',
                event_description: 'Industry leaders discuss current trends and career opportunities',
                event_type: 'Tech Talk',
                event_date: '2025-11-01', // Future event
                event_time: '15:00:00',
                duration_hours: 2,
                venue: 'Main Auditorium',
                max_capacity: 200,
                created_by: 'Career Services'
            },
            // CMU Events
            {
                college_id: 'CMU001',
                event_name: 'Cybersecurity Workshop',
                event_description: 'Hands-on cybersecurity training and ethical hacking',
                event_type: 'Workshop',
                event_date: '2025-08-30', // Past event
                event_time: '13:00:00',
                duration_hours: 4,
                venue: 'Security Lab',
                max_capacity: 20,
                created_by: 'Prof. Security Expert'
            },
            {
                college_id: 'CMU001',
                event_name: 'Game Development Hackathon',
                event_description: '48-hour game development competition',
                event_type: 'Hackathon',
                event_date: '2025-11-10', // Future event
                event_time: '18:00:00',
                duration_hours: 48,
                venue: 'Game Dev Studio',
                max_capacity: 40,
                created_by: 'Game Dev Club'
            }
        ];

        console.log('🎯 Creating events...');
        const createdEvents = [];
        for (const event of events) {
            const created = await Event.create(event);
            createdEvents.push(created);
        }
        console.log(`✅ Created ${createdEvents.length} events`);

        // Create registrations (students register for events)
        console.log('📝 Creating registrations...');
        const registrations = [
            // MIT React Workshop
            { student_id: createdStudents[0].student_id, event_id: createdEvents[0].event_id },
            { student_id: createdStudents[1].student_id, event_id: createdEvents[0].event_id },
            { student_id: createdStudents[2].student_id, event_id: createdEvents[0].event_id },
            { student_id: createdStudents[3].student_id, event_id: createdEvents[0].event_id },
            { student_id: createdStudents[4].student_id, event_id: createdEvents[0].event_id },
            
            // MIT AI Ethics Seminar
            { student_id: createdStudents[0].student_id, event_id: createdEvents[1].event_id },
            { student_id: createdStudents[2].student_id, event_id: createdEvents[1].event_id },
            { student_id: createdStudents[4].student_id, event_id: createdEvents[1].event_id },
            
            // MIT TechFest
            { student_id: createdStudents[0].student_id, event_id: createdEvents[2].event_id },
            { student_id: createdStudents[1].student_id, event_id: createdEvents[2].event_id },
            { student_id: createdStudents[2].student_id, event_id: createdEvents[2].event_id },
            { student_id: createdStudents[3].student_id, event_id: createdEvents[2].event_id },
            { student_id: createdStudents[4].student_id, event_id: createdEvents[2].event_id },
            
            // Stanford ML Bootcamp
            { student_id: createdStudents[5].student_id, event_id: createdEvents[4].event_id },
            { student_id: createdStudents[6].student_id, event_id: createdEvents[4].event_id },
            { student_id: createdStudents[7].student_id, event_id: createdEvents[4].event_id },
            
            // Stanford Tech Panel
            { student_id: createdStudents[5].student_id, event_id: createdEvents[5].event_id },
            { student_id: createdStudents[6].student_id, event_id: createdEvents[5].event_id },
            
            // CMU Cybersecurity Workshop
            { student_id: createdStudents[8].student_id, event_id: createdEvents[6].event_id },
            { student_id: createdStudents[9].student_id, event_id: createdEvents[6].event_id },
            
            // CMU Game Dev Hackathon
            { student_id: createdStudents[8].student_id, event_id: createdEvents[7].event_id },
            { student_id: createdStudents[9].student_id, event_id: createdEvents[7].event_id }
        ];

        for (const reg of registrations) {
            try {
                await Registration.create(reg.student_id, reg.event_id);
            } catch (error) {
                console.log(`Registration already exists: ${reg.student_id} -> ${reg.event_id}`);
            }
        }
        console.log(`✅ Created ${registrations.length} registrations`);

        // Mark attendance for some students (past events only - for demo we'll assume some events happened)
        console.log('✅ Marking attendance...');
        const attendanceRecords = [
            // React Workshop attendees
            { student_id: createdStudents[0].student_id, event_id: createdEvents[0].event_id },
            { student_id: createdStudents[1].student_id, event_id: createdEvents[0].event_id },
            { student_id: createdStudents[2].student_id, event_id: createdEvents[0].event_id },
            { student_id: createdStudents[4].student_id, event_id: createdEvents[0].event_id },
            
            // AI Ethics Seminar attendees
            { student_id: createdStudents[0].student_id, event_id: createdEvents[1].event_id },
            { student_id: createdStudents[2].student_id, event_id: createdEvents[1].event_id },
            
            // Stanford ML Bootcamp attendees
            { student_id: createdStudents[5].student_id, event_id: createdEvents[4].event_id },
            { student_id: createdStudents[6].student_id, event_id: createdEvents[4].event_id },
            
            // CMU Cybersecurity Workshop attendees
            { student_id: createdStudents[8].student_id, event_id: createdEvents[6].event_id }
        ];

        for (const att of attendanceRecords) {
            try {
                await Attendance.markAttendance(att.student_id, att.event_id);
            } catch (error) {
                console.log(`Could not mark attendance: ${error.message}`);
            }
        }
        console.log(`✅ Marked attendance for ${attendanceRecords.length} records`);

        // Add feedback for attended events
        console.log('📊 Adding feedback...');
        const feedbackRecords = [
            { student_id: createdStudents[0].student_id, event_id: createdEvents[0].event_id, rating: 5, comments: 'Excellent workshop! Learned a lot about React.' },
            { student_id: createdStudents[1].student_id, event_id: createdEvents[0].event_id, rating: 4, comments: 'Great content, could use more hands-on examples.' },
            { student_id: createdStudents[2].student_id, event_id: createdEvents[0].event_id, rating: 5, comments: 'Perfect introduction to React. Highly recommend!' },
            { student_id: createdStudents[4].student_id, event_id: createdEvents[0].event_id, rating: 4, comments: 'Good workshop, well organized.' },
            
            { student_id: createdStudents[0].student_id, event_id: createdEvents[1].event_id, rating: 4, comments: 'Thought-provoking discussion on AI ethics.' },
            { student_id: createdStudents[2].student_id, event_id: createdEvents[1].event_id, rating: 5, comments: 'Important topic, excellent speakers.' },
            
            { student_id: createdStudents[5].student_id, event_id: createdEvents[4].event_id, rating: 5, comments: 'Amazing ML bootcamp! Comprehensive and practical.' },
            { student_id: createdStudents[6].student_id, event_id: createdEvents[4].event_id, rating: 5, comments: 'Best ML training I have attended.' },
            
            { student_id: createdStudents[8].student_id, event_id: createdEvents[6].event_id, rating: 4, comments: 'Great cybersecurity insights and hands-on practice.' }
        ];

        for (const feedback of feedbackRecords) {
            try {
                await Feedback.create(feedback.student_id, feedback.event_id, feedback.rating, feedback.comments);
            } catch (error) {
                console.log(`Could not add feedback: ${error.message}`);
            }
        }
        console.log(`✅ Added ${feedbackRecords.length} feedback records`);

        console.log('\n🎉 Sample data insertion completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- ${colleges.length} colleges created`);
        console.log(`- ${createdStudents.length} students created`);
        console.log(`- ${createdEvents.length} events created`);
        console.log(`- ${registrations.length} registrations created`);
        console.log(`- ${attendanceRecords.length} attendance records`);
        console.log(`- ${feedbackRecords.length} feedback records`);
        
        console.log('\n🚀 You can now test the API with sample data!');
        console.log('Try these endpoints:');
        console.log('- GET /api/v1/colleges');
        console.log('- GET /api/v1/events');
        console.log('- GET /api/v1/reports/event-popularity');
        console.log('- GET /api/v1/reports/top-students');

    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
    } finally {
        await database.close();
        process.exit(0);
    }
}

// Run the script
if (require.main === module) {
    insertSampleData();
}

module.exports = insertSampleData;
