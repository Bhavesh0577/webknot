const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');

// Event management routes
router.post('/', EventController.createEvent);
router.get('/', EventController.getAllEvents);
router.get('/:event_id', EventController.getEventById);
router.put('/:event_id', EventController.updateEvent);
router.patch('/:event_id/cancel', EventController.cancelEvent);

// Event-specific data routes
router.get('/:event_id/registrations', EventController.getEventRegistrations);
router.get('/:event_id/attendance', EventController.getEventAttendance);
router.get('/:event_id/feedback', EventController.getEventFeedback);

module.exports = router;
