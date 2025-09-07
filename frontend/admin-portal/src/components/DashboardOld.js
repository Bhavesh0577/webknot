import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from './ui/card';

const API_BASE_URL = 'http://localhost:3000/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [collegesRes, eventsRes, topStudentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/colleges`),
        axios.get(`${API_BASE_URL}/events`),
        axios.get(`${API_BASE_URL}/reports/top-students?limit=5`)
      ]);

      const colleges = collegesRes.data.data || collegesRes.data;
      const events = eventsRes.data.data || eventsRes.data;
      const students = topStudentsRes.data.data || topStudentsRes.data;

      setStats({
        totalColleges: Array.isArray(colleges) ? colleges.length : 0,
        totalEvents: Array.isArray(events) ? events.length : 0,
        activeEvents: Array.isArray(events) ? events.filter(e => e.status === 'active').length : 0,
        completedEvents: Array.isArray(events) ? events.filter(e => e.status === 'completed').length : 0
      });

      setRecentEvents(Array.isArray(events) ? events.slice(0, 5) : []);
      setTopStudents(Array.isArray(students) ? students : []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setRecentEvents([]);
      setTopStudents([]);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h1>Dashboard</h1>
        <button className="btn btn-primary" onClick={loadDashboardData}>
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalColleges}</div>
          <div className="stat-label">Total Colleges</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.activeEvents}</div>
          <div className="stat-label">Active Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completedEvents}</div>
          <div className="stat-label">Completed Events</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Recent Events */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Events</h3>
          </div>
          <div>
            {recentEvents && recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event.event_id} className="flex-between mb-2" style={{ padding: '0.75rem 0', borderBottom: '1px solid #e9ecef' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{event.event_name}</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                      {formatDateTime(event.event_date, event.event_time)}
                    </div>
                  </div>
                  <span className={`badge badge-${getEventTypeColor(event.event_type)}`}>
                    {event.event_type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-secondary">No recent events</p>
            )}
          </div>
        </div>

        {/* Top Students */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Active Students</h3>
          </div>
          <div>
            {topStudents && topStudents.length > 0 ? (
              topStudents.map((student, index) => (
                <div key={student.student_id} className="flex-between mb-2" style={{ padding: '0.75rem 0', borderBottom: '1px solid #e9ecef' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {index + 1}. {student.student_name}
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                      {student.department}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                    <div>{student.events_attended} events attended</div>
                    <div className="text-secondary">Score: {student.activity_score}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary">No student data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
