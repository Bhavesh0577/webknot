const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/studentController');

// Student management routes
router.get('/', StudentController.getAllStudents);
router.post('/', StudentController.createStudent);
router.get('/:student_id', StudentController.getStudentById);
router.put('/:student_id', StudentController.updateStudent);

// Student activity routes
router.get('/:student_id/registrations', StudentController.getStudentRegistrations);
router.get('/:student_id/attendance', StudentController.getStudentAttendance);
router.get('/:student_id/feedback', StudentController.getStudentFeedback);

// Registration management
router.post('/register', StudentController.registerForEvent);
router.delete('/registrations/:registration_id', StudentController.cancelRegistration);

// Attendance management
router.post('/attendance', StudentController.markAttendance);

// Feedback management
router.post('/feedback', StudentController.submitFeedback);

// Get students by college
router.get('/college/:college_id', StudentController.getStudentsByCollege);

module.exports = router;
