import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

function StudentPortal() {
  const [currentStudent, setCurrentStudent] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [colleges, setColleges] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [currentSection, setCurrentSection] = useState('events');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });

  const [loginData, setLoginData] = useState({
    email: '',
    phone: ''
  });

  const [registrationData, setRegistrationData] = useState({
    special_requirements: ''
  });

  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comments: ''
  });

  useEffect(() => {
    loadColleges();
  }, []);

  useEffect(() => {
    if (selectedCollege) {
      loadEvents();
    }
  }, [selectedCollege, filters]);

  useEffect(() => {
    if (currentStudent) {
      loadRegistrations();
    }
  }, [currentStudent]);

  const loadColleges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/colleges`);
      setColleges(response.data);
    } catch (error) {
      console.error('Failed to load colleges:', error);
    }
  };

  const loadEvents = async () => {
    try {
      let url = `${API_BASE_URL}/events?college_id=${selectedCollege}`;
      if (filters.type) url += `&event_type=${filters.type}`;
      if (filters.status) url += `&status=${filters.status}`;

      const response = await axios.get(url);
      let filteredEvents = response.data;

      // Apply search filter
      if (filters.search) {
        filteredEvents = filteredEvents.filter(event =>
          event.event_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const loadRegistrations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/${currentStudent.student_id}/registrations`);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    }
  };

  const handleCollegeChange = (e) => {
    setSelectedCollege(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Find student by email and phone
      const response = await axios.get(`${API_BASE_URL}/students/college/${selectedCollege}`);
      const students = response.data;
      const student = students.find(s => s.email === loginData.email && s.phone === loginData.phone);

      if (student) {
        setCurrentStudent(student);
        setShowLoginModal(false);
        setLoginData({ email: '', phone: '' });
        alert('Login successful!');
      } else {
        alert('Student not found. Please check your email and phone number.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleEventRegistration = async (event) => {
    if (!currentStudent) {
      setShowLoginModal(true);
      return;
    }

    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const confirmRegistration = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/events/${selectedEvent.event_id}/register`, {
        student_id: currentStudent.student_id,
        special_requirements: registrationData.special_requirements
      });

      setShowRegistrationModal(false);
      setRegistrationData({ special_requirements: '' });
      await loadRegistrations();
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. You may already be registered for this event.');
    }
  };

  const openFeedbackModal = (event) => {
    setSelectedEvent(event);
    setShowFeedbackModal(true);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/events/${selectedEvent.event_id}/feedback`, {
        student_id: currentStudent.student_id,
        rating: feedbackData.rating,
        comments: feedbackData.comments
      });

      setShowFeedbackModal(false);
      setFeedbackData({ rating: 0, comments: '' });
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Feedback submission failed:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const logout = () => {
    setCurrentStudent(null);
    setRegistrations([]);
    setCurrentSection('events');
  };

  const formatDateTime = (date, time) => {
    const eventDate = new Date(date);
    return `${eventDate.toLocaleDateString()} at ${time}`;
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
      'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const StarRating = ({ rating, onRatingChange }) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'active' : ''}`}
            onClick={() => onRatingChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>Campus Events</h1>
            <span className="header-subtitle">Student Portal</span>
          </div>
          <div className="header-right">
            {currentStudent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>Welcome, {currentStudent.student_name}</span>
                <button className="btn btn-outline-primary btn-sm" onClick={logout}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowLoginModal(true)}>
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* College Selection */}
        {!selectedCollege && (
          <div className="college-selection">
            <div className="container">
              <h2>Select Your College</h2>
              <select 
                className="form-select" 
                style={{ maxWidth: '400px', margin: '0 auto' }}
                value={selectedCollege}
                onChange={handleCollegeChange}
              >
                <option value="">Choose your college...</option>
                {colleges.map(college => (
                  <option key={college.college_id} value={college.college_id}>
                    {college.college_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Events Section */}
        {selectedCollege && currentSection === 'events' && (
          <div className="events-section">
            <div className="container">
              {/* Filters */}
              <div className="filters-section">
                <h2>Campus Events</h2>
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Event Type</label>
                    <select 
                      className="form-select"
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="">All Types</option>
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Competition">Competition</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Status</label>
                    <select 
                      className="form-select"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="">All Events</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Search</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Search events..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Events Grid */}
              <div className="events-grid">
                {events.map(event => (
                  <div key={event.event_id} className="event-card">
                    <div className="event-card-header">
                      <div className="event-title">{event.event_name}</div>
                      <span className="event-type">{event.event_type}</span>
                    </div>
                    <div className="event-card-body">
                      <div className="event-details">
                        <div className="event-detail">
                          <span className="event-detail-icon">📅</span>
                          {formatDateTime(event.event_date, event.event_time)}
                        </div>
                        <div className="event-detail">
                          <span className="event-detail-icon">📍</span>
                          {event.venue}
                        </div>
                        <div className="event-detail">
                          <span className="event-detail-icon">👥</span>
                          Capacity: {event.max_capacity}
                        </div>
                      </div>
                      <div className="event-description">
                        {event.description}
                      </div>
                    </div>
                    <div className="event-card-footer">
                      <span className={`badge badge-${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      {event.status === 'active' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEventRegistration(event)}
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {events.length === 0 && (
                <div className="no-events">
                  <div className="no-events-content">
                    <h3>No Events Found</h3>
                    <p>There are no events matching your criteria.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Registrations Section */}
        {selectedCollege && currentSection === 'registrations' && (
          <div className="my-registrations">
            <div className="container">
              <h2>My Event Registrations</h2>
              <div className="events-grid">
                {registrations.map(reg => (
                  <div key={reg.registration_id} className="event-card">
                    <div className="event-card-header">
                      <div className="event-title">{reg.event_name}</div>
                      <span className="event-type">{reg.event_type}</span>
                    </div>
                    <div className="event-card-body">
                      <div className="event-details">
                        <div className="event-detail">
                          <span className="event-detail-icon">📅</span>
                          {formatDateTime(reg.event_date, reg.event_time)}
                        </div>
                        <div className="event-detail">
                          <span className="event-detail-icon">📍</span>
                          {reg.venue}
                        </div>
                        <div className="event-detail">
                          <span className="event-detail-icon">✅</span>
                          Registered on: {new Date(reg.registration_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="event-card-footer">
                      <span className={`badge badge-${getStatusColor(reg.status)}`}>
                        {reg.status}
                      </span>
                      {reg.status === 'completed' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => openFeedbackModal(reg)}
                        >
                          Give Feedback
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {registrations.length === 0 && (
                <div className="no-registrations">
                  <div className="no-events-content">
                    <h3>No Registrations Yet</h3>
                    <p>You haven't registered for any events yet. Browse events to get started!</p>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setCurrentSection('events')}
                    >
                      Browse Events
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      {selectedCollege && (
        <nav className="bottom-nav">
          <button 
            className={`nav-btn ${currentSection === 'events' ? 'active' : ''}`}
            onClick={() => setCurrentSection('events')}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-label">Events</span>
          </button>
          <button 
            className={`nav-btn ${currentSection === 'registrations' ? 'active' : ''}`}
            onClick={() => setCurrentSection('registrations')}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-label">My Events</span>
          </button>
          <button className="nav-btn" onClick={() => alert('QR Scanner not implemented in demo')}>
            <span className="nav-icon">📱</span>
            <span className="nav-label">Check-in</span>
          </button>
        </nav>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Student Login</h3>
              <button className="close" onClick={() => setShowLoginModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleLogin} className="modal-body">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={loginData.phone}
                  onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLoginModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Login</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Event Registration</h3>
              <button className="close" onClick={() => setShowRegistrationModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4>{selectedEvent.event_name}</h4>
                <p><strong>Date:</strong> {formatDateTime(selectedEvent.event_date, selectedEvent.event_time)}</p>
                <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                <p><strong>Type:</strong> {selectedEvent.event_type}</p>
              </div>
              <form onSubmit={confirmRegistration}>
                <div className="form-group">
                  <label>Dietary Requirements (Optional)</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Any dietary restrictions or special requirements..."
                    value={registrationData.special_requirements}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, special_requirements: e.target.value }))}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRegistrationModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Confirm Registration</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedEvent && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Event Feedback</h3>
              <button className="close" onClick={() => setShowFeedbackModal(false)}>&times;</button>
            </div>
            <form onSubmit={submitFeedback} className="modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <h4>{selectedEvent.event_name}</h4>
              </div>
              <div className="form-group">
                <label>Overall Rating</label>
                <StarRating
                  rating={feedbackData.rating}
                  onRatingChange={(rating) => setFeedbackData(prev => ({ ...prev, rating }))}
                />
              </div>
              <div className="form-group">
                <label>Comments</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Share your feedback about the event..."
                  value={feedbackData.comments}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFeedbackModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPortal;
