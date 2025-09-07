const Student = require('../models/Student');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');

class StudentController {
    static async createStudent(req, res) {
        try {
            const student = await Student.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Student created successfully',
                data: student
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getStudentById(req, res) {
        try {
            const student = await Student.getById(req.params.student_id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            // Get participation stats
            const stats = await Student.getParticipationStats(req.params.student_id);

            res.json({
                success: true,
                data: {
                    ...student,
                    participation_stats: stats
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getAllStudents(req, res) {
        try {
            const students = await Student.getAll(req.query);
            res.json({
                success: true,
                data: students,
                count: students.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getStudentsByCollege(req, res) {
        try {
            const students = await Student.getByCollege(req.params.college_id, req.query);
            res.json({
                success: true,
                data: students,
                count: students.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async updateStudent(req, res) {
        try {
            await Student.update(req.params.student_id, req.body);
            const updatedStudent = await Student.getById(req.params.student_id);
            
            res.json({
                success: true,
                message: 'Student updated successfully',
                data: updatedStudent
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async registerForEvent(req, res) {
        try {
            const { student_id, event_id } = req.body;
            const registration = await Registration.create(student_id, event_id);
            
            res.status(201).json({
                success: true,
                message: `Registration ${registration.status}`,
                data: registration
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getStudentRegistrations(req, res) {
        try {
            const registrations = await Registration.getByStudent(req.params.student_id, req.query.status);
            res.json({
                success: true,
                data: registrations,
                count: registrations.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async cancelRegistration(req, res) {
        try {
            const result = await Registration.cancel(req.params.registration_id);
            res.json({
                success: true,
                message: 'Registration cancelled successfully',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async markAttendance(req, res) {
        try {
            const { student_id, event_id } = req.body;
            const attendance = await Attendance.markAttendance(student_id, event_id);
            
            res.status(201).json({
                success: true,
                message: 'Attendance marked successfully',
                data: attendance
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getStudentAttendance(req, res) {
        try {
            const attendance = await Attendance.getByStudent(req.params.student_id);
            res.json({
                success: true,
                data: attendance,
                count: attendance.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async submitFeedback(req, res) {
        try {
            const { student_id, event_id, rating, comments } = req.body;
            const feedback = await Feedback.create(student_id, event_id, rating, comments);
            
            res.status(201).json({
                success: true,
                message: 'Feedback submitted successfully',
                data: feedback
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getStudentFeedback(req, res) {
        try {
            const feedback = await Feedback.getByStudent(req.params.student_id);
            res.json({
                success: true,
                data: feedback,
                count: feedback.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = StudentController;
