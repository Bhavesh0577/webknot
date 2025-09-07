import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays,
  MapPin,
  Users,
  Search,
  Filter,
  Star,
  LogIn,
  LogOut,
  UserCheck,
  Clock,
  Building2,
  Heart,
  MessageSquare,
  QrCode
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';

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
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/colleges`);
      const collegesData = response.data.data || response.data;
      setColleges(Array.isArray(collegesData) ? collegesData : []);
    } catch (error) {
      console.error('Failed to load colleges:', error);
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/events?college_id=${selectedCollege}`;
      if (filters.type) url += `&event_type=${filters.type}`;
      if (filters.status) url += `&status=${filters.status}`;

      const response = await axios.get(url);
      const eventsData = response.data.data || response.data;
      let filteredEvents = Array.isArray(eventsData) ? eventsData : [];

      // Apply search filter
      if (filters.search) {
        filteredEvents = filteredEvents.filter(event =>
          event.event_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.event_description?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/${currentStudent.student_id}/registrations`);
      const registrationsData = response.data.data || response.data;
      setRegistrations(Array.isArray(registrationsData) ? registrationsData : []);
    } catch (error) {
      console.error('Failed to load registrations:', error);
      setRegistrations([]);
    }
  };

  const handleCollegeChange = (collegeId) => {
    setSelectedCollege(collegeId);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Find student by email and phone
      const response = await axios.get(`${API_BASE_URL}/students/college/${selectedCollege}`);
      const studentsData = response.data.data || response.data;
      const students = Array.isArray(studentsData) ? studentsData : [];
      const student = students.find(s => s.email === loginData.email && s.phone === loginData.phone);

      if (student) {
        setCurrentStudent(student);
        setShowLoginModal(false);
        setLoginData({ email: '', phone: '' });
      } else {
        alert('Student not found. Please check your email and phone number.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const openFeedbackModal = (event) => {
    setSelectedEvent(event);
    setShowFeedbackModal(true);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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
      'Technical': 'info',
      'Cultural': 'warning',
      'Sports': 'success',
      'Workshop': 'info',
      'Seminar': 'secondary',
      'Competition': 'destructive'
    };
    return colors[type] || 'secondary';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'success',
      'completed': 'secondary',
      'cancelled': 'destructive'
    };
    return colors[status] || 'secondary';
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${readonly ? 'cursor-default' : 'hover:text-yellow-400'}`}
            onClick={() => !readonly && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  if (!selectedCollege) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Campus Events</h1>
                  <p className="text-sm text-gray-600">Student Portal</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* College Selection */}
        <main className="max-w-2xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome!</h2>
            <p className="text-lg text-gray-600">Select your college to get started</p>
          </motion.div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Choose Your College</CardTitle>
              <CardDescription className="text-center">
                Find and register for events at your institution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3">
                  {colleges.map(college => (
                    <motion.button
                      key={college.college_id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCollegeChange(college.college_id)}
                      className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{college.college_name}</h3>
                          <p className="text-sm text-gray-500">{college.location}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const selectedCollegeData = colleges.find(c => c.college_id === selectedCollege);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Campus Events</h1>
                <p className="text-sm text-gray-600">{selectedCollegeData?.college_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {currentStudent ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentStudent.student_name}`} />
                      <AvatarFallback>{currentStudent.student_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {currentStudent.student_name}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLoginModal(true)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {currentSection === 'events' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filter Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="">All Events</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search events..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Events Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {events.map((event, index) => (
                    <motion.div
                      key={event.event_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-200 h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{event.event_name}</CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={getEventTypeColor(event.event_type)}>
                                  {event.event_type}
                                </Badge>
                                <Badge variant={getStatusColor(event.status)}>
                                  {event.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {event.event_description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                              {formatDateTime(event.event_date, event.event_time)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {event.venue}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              Max {event.max_capacity} participants
                            </div>
                          </div>

                          {event.status === 'active' && (
                            <Button 
                              className="w-full"
                              onClick={() => handleEventRegistration(event)}
                              disabled={loading}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Register
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {events.length === 0 && !loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
                  <p className="text-gray-500">
                    There are no events matching your criteria.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentSection === 'registrations' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Event Registrations</CardTitle>
                <CardDescription>
                  Events you've registered for and attended
                </CardDescription>
              </CardHeader>
            </Card>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {registrations.map((reg, index) => (
                    <motion.div
                      key={reg.registration_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{reg.event_name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getEventTypeColor(reg.event_type)}>
                              {reg.event_type}
                            </Badge>
                            <Badge variant={getStatusColor(reg.status)}>
                              {reg.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                              {formatDateTime(reg.event_date, reg.event_time)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {reg.venue}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              Registered: {new Date(reg.registration_date).toLocaleDateString()}
                            </div>
                          </div>

                          {reg.status === 'completed' && (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => openFeedbackModal(reg)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Give Feedback
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {registrations.length === 0 && !loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Registrations Yet</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't registered for any events yet. Browse events to get started!
                  </p>
                  <Button onClick={() => setCurrentSection('events')}>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Browse Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-around">
            <button 
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentSection === 'events' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setCurrentSection('events')}
            >
              <CalendarDays className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Events</span>
            </button>
            <button 
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentSection === 'registrations' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setCurrentSection('registrations')}
            >
              <UserCheck className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">My Events</span>
            </button>
            <button 
              className="flex flex-col items-center py-2 px-4 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => alert('QR Scanner not implemented in demo')}
            >
              <QrCode className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Check-in</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Student Login</h3>
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleLogin} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={loginData.phone}
                      onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowLoginModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistrationModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Event Registration</h3>
                <button 
                  onClick={() => setShowRegistrationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedEvent.event_name}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Date:</strong> {formatDateTime(selectedEvent.event_date, selectedEvent.event_time)}</p>
                      <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                      <p><strong>Type:</strong> {selectedEvent.event_type}</p>
                    </div>
                  </CardContent>
                </Card>
                <form onSubmit={confirmRegistration}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requirements (Optional)
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Any dietary restrictions or special requirements..."
                        value={registrationData.special_requirements}
                        onChange={(e) => setRegistrationData(prev => ({ ...prev, special_requirements: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowRegistrationModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Registering...' : 'Confirm Registration'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Event Feedback</h3>
                <button 
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={submitFeedback} className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900">{selectedEvent.event_name}</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                    <StarRating
                      rating={feedbackData.rating}
                      onRatingChange={(rating) => setFeedbackData(prev => ({ ...prev, rating }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      placeholder="Share your feedback about the event..."
                      value={feedbackData.comments}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StudentPortal;
