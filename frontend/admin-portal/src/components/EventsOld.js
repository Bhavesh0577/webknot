import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

function Events() {
  const [events, setEvents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    college_id: '',
    event_type: '',
    status: ''
  });

  const [newEvent, setNewEvent] = useState({
    event_name: '',
    event_type: 'Workshop',
    event_date: '',
    event_time: '',
    venue: '',
    event_description: '',
    max_capacity: '',
    college_id: '',
    duration_hours: 2,
    created_by: 'admin'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const collegesRes = await axios.get(`${API_BASE_URL}/colleges`);
      const collegesData = collegesRes.data.data || collegesRes.data;
      setColleges(Array.isArray(collegesData) ? collegesData : []);
      await loadEvents();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      let url = `${API_BASE_URL}/events?`;
      if (filters.college_id) url += `college_id=${filters.college_id}&`;
      if (filters.event_type) url += `event_type=${filters.event_type}&`;
      if (filters.status) url += `status=${filters.status}&`;

      const response = await axios.get(url);
      const eventsData = response.data.data || response.data;
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]); // Ensure events is always an array
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/events`, newEvent);
      setShowModal(false);
      setNewEvent({
        event_name: '',
        event_type: 'Workshop',
        event_date: '',
        event_time: '',
        venue: '',
        event_description: '',
        max_capacity: '',
        college_id: '',
        duration_hours: 2,
        created_by: 'admin'
      });
      await loadEvents();
      alert('Event created successfully!');
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const formatDateTime = (date, time) => {
    const eventDate = new Date(date);
    return `${eventDate.toLocaleDateString()} ${time}`;
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'Technical': 'primary',
      'Cultural': 'warning',
      'Sports': 'success',
      'Workshop': 'info',
      'Seminar': 'secondary',
      'Competition': 'danger'
    };
    return colors[type] || 'secondary';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'success',
      'completed': 'secondary',
      'cancelled': 'danger',
      'draft': 'warning'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div>Loading events...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h1>Events Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Filters</h3>
        </div>
        <div className="grid grid-3">
          <div>
            <label className="form-label">College</label>
            <select
              className="form-input"
              value={filters.college_id}
              onChange={(e) => handleFilterChange('college_id', e.target.value)}
            >
              <option value="">All Colleges</option>
              {colleges && colleges.length > 0 && colleges.map(college => (
                <option key={college.college_id} value={college.college_id}>
                  {college.college_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Event Type</label>
            <select
              className="form-input"
              value={filters.event_type}
              onChange={(e) => handleFilterChange('event_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Workshop">Workshop</option>
              <option value="Fest">Fest</option>
              <option value="Seminar">Seminar</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Tech Talk">Tech Talk</option>
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Type</th>
              <th>Date & Time</th>
              <th>Venue</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events && events.length > 0 ? (
              events.map((event) => (
                <tr key={event.event_id}>
                  <td>{event.event_name}</td>
                  <td>
                    <span className={`badge badge-${getEventTypeColor(event.event_type)}`}>
                      {event.event_type}
                    </span>
                  </td>
                  <td>{formatDateTime(event.event_date, event.event_time)}</td>
                  <td>{event.venue}</td>
                  <td>{event.max_capacity}</td>
                  <td>
                    <span className={`badge badge-${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" style={{ marginRight: '0.5rem' }}>
                      View
                    </button>
                    <button className="btn btn-warning btn-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No events found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create New Event</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="grid grid-2">
                <div>
                  <label className="form-label">Event Name</label>
                  <input
                    type="text"
                    name="event_name"
                    className="form-input"
                    value={newEvent.event_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Event Type</label>
                  <select
                    name="event_type"
                    className="form-input"
                    value={newEvent.event_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Fest">Fest</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Tech Talk">Tech Talk</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="event_date"
                    className="form-input"
                    value={newEvent.event_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Time</label>
                  <input
                    type="time"
                    name="event_time"
                    className="form-input"
                    value={newEvent.event_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    className="form-input"
                    value={newEvent.venue}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Max Capacity</label>
                  <input
                    type="number"
                    name="max_capacity"
                    className="form-input"
                    value={newEvent.max_capacity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Duration (hours)</label>
                  <input
                    type="number"
                    name="duration_hours"
                    className="form-input"
                    value={newEvent.duration_hours}
                    onChange={handleInputChange}
                    min="1"
                    max="24"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">College</label>
                  <select
                    name="college_id"
                    className="form-input"
                    value={newEvent.college_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select College</option>
                    {colleges && colleges.length > 0 && colleges.map(college => (
                      <option key={college.college_id} value={college.college_id}>
                        {college.college_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label className="form-label">Description</label>
                <textarea
                  name="event_description"
                  className="form-input"
                  rows="3"
                  value={newEvent.event_description}
                  onChange={handleInputChange}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
