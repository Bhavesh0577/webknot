const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

// Event popularity report
router.get('/event-popularity', ReportController.getEventPopularityReport);

// Student participation reports
router.get('/student-participation', ReportController.getStudentParticipationReport);

// Top active students
router.get('/top-students', ReportController.getTopActiveStudents);

// Attendance statistics
router.get('/attendance-stats', ReportController.getAttendanceStats);

// Feedback reports
router.get('/feedback', ReportController.getFeedbackReport);

module.exports = router;
