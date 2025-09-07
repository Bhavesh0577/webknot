const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');

class EventController {
    static async createEvent(req, res) {
        try {
            const event = await Event.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                data: event
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getAllEvents(req, res) {
        try {
            const events = await Event.getAll(req.query);
            res.json({
                success: true,
                data: events,
                count: events.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getEventById(req, res) {
        try {
            const event = await Event.getById(req.params.event_id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            // Get additional stats
            const registrationCount = await Event.getRegistrationCount(req.params.event_id);
            const attendanceCount = await Event.getAttendanceCount(req.params.event_id);
            const feedbackStats = await Event.getAverageFeedback(req.params.event_id);

            res.json({
                success: true,
                data: {
                    ...event,
                    stats: {
                        registrations: registrationCount,
                        attendance: attendanceCount,
                        average_rating: feedbackStats.average_rating,
                        feedback_count: feedbackStats.feedback_count
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async updateEvent(req, res) {
        try {
            await Event.update(req.params.event_id, req.body);
            const updatedEvent = await Event.getById(req.params.event_id);
            
            res.json({
                success: true,
                message: 'Event updated successfully',
                data: updatedEvent
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async cancelEvent(req, res) {
        try {
            await Event.cancel(req.params.event_id);
            res.json({
                success: true,
                message: 'Event cancelled successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getEventRegistrations(req, res) {
        try {
            const registrations = await Registration.getByEvent(req.params.event_id);
            const stats = await Registration.getEventStats(req.params.event_id);
            
            res.json({
                success: true,
                data: registrations,
                stats: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getEventAttendance(req, res) {
        try {
            const attendance = await Attendance.getByEvent(req.params.event_id);
            const stats = await Attendance.getAttendanceStats(req.params.event_id);
            
            res.json({
                success: true,
                data: attendance,
                stats: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getEventFeedback(req, res) {
        try {
            const feedback = await Feedback.getByEvent(req.params.event_id);
            const stats = await Feedback.getFeedbackStats(req.params.event_id);
            
            res.json({
                success: true,
                data: feedback,
                stats: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = EventController;
