import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

function Reports() {
  const [eventPopularity, setEventPopularity] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [studentParticipation, setStudentParticipation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      const [eventPopularityRes, attendanceStatsRes, studentParticipationRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/reports/event-popularity?limit=10`),
        axios.get(`${API_BASE_URL}/reports/attendance-stats`),
        axios.get(`${API_BASE_URL}/reports/student-participation?limit=10`)
      ]);

      const eventPopData = eventPopularityRes.data.data || eventPopularityRes.data;
      const attendanceData = attendanceStatsRes.data.data || attendanceStatsRes.data;
      const participationData = studentParticipationRes.data.data || studentParticipationRes.data;

      setEventPopularity(Array.isArray(eventPopData) ? eventPopData : []);
      setAttendanceStats(Array.isArray(attendanceData) ? attendanceData : []);
      setStudentParticipation(Array.isArray(participationData) ? participationData : []);
    } catch (error) {
      console.error('Failed to load reports data:', error);
      setEventPopularity([]);
      setAttendanceStats([]);
      setStudentParticipation([]);
    } finally {
      setLoading(false);
    }
  };

  const SimpleBarChart = ({ data, title, valueKey, labelKey }) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center text-secondary">
          No data available
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => item[valueKey] || 0));

    return (
      <div>
        <h4 style={{ marginBottom: '1rem' }}>{title}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ minWidth: '120px', fontSize: '0.875rem' }}>
                {item[labelKey]}
              </div>
              <div style={{ flex: 1, backgroundColor: '#e9ecef', borderRadius: '4px', height: '20px', position: 'relative' }}>
                <div
                  style={{
                    backgroundColor: '#007bff',
                    height: '100%',
                    width: `${(item[valueKey] / maxValue) * 100}%`,
                    borderRadius: '4px',
                    minWidth: '2px'
                  }}
                />
              </div>
              <div style={{ minWidth: '40px', fontSize: '0.875rem', textAlign: 'right' }}>
                {item[valueKey]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div>Loading reports...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h1>Reports & Analytics</h1>
        <button className="btn btn-primary" onClick={loadReportsData}>
          Refresh Data
        </button>
      </div>

      <div className="grid grid-2">
        {/* Event Popularity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Most Popular Events</h3>
          </div>
          <SimpleBarChart
            data={eventPopularity}
            title="Registration Count"
            valueKey="total_registrations"
            labelKey="event_name"
          />
        </div>

        {/* Student Participation */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Active Students</h3>
          </div>
          <SimpleBarChart
            data={studentParticipation}
            title="Events Attended"
            valueKey="events_attended"
            labelKey="student_name"
          />
        </div>
      </div>

      {/* Attendance Stats by Event Type */}
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Attendance Statistics by Event Type</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Total Events</th>
                <th>Total Registrations</th>
                <th>Total Attendance</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              {attendanceStats.length > 0 ? (
                attendanceStats.map((stat, index) => (
                  <tr key={index}>
                    <td>
                      <span className="badge badge-primary">{stat.event_type}</span>
                    </td>
                    <td>{stat.total_events}</td>
                    <td>{stat.total_registrations}</td>
                    <td>{stat.total_attendance}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          backgroundColor: '#e9ecef', 
                          borderRadius: '4px', 
                          height: '8px', 
                          width: '60px',
                          position: 'relative'
                        }}>
                          <div
                            style={{
                              backgroundColor: '#28a745',
                              height: '100%',
                              width: `${stat.average_attendance_percentage || 0}%`,
                              borderRadius: '4px',
                              minWidth: '2px'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.875rem' }}>
                          {parseFloat(stat.average_attendance_percentage || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No attendance data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid mt-4">
        <div className="stat-card">
          <div className="stat-number">
            {eventPopularity.reduce((sum, event) => sum + (event.total_registrations || 0), 0)}
          </div>
          <div className="stat-label">Total Registrations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {attendanceStats.reduce((sum, stat) => sum + (stat.total_attendance || 0), 0)}
          </div>
          <div className="stat-label">Total Attendance</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {attendanceStats.length > 0 
              ? (attendanceStats.reduce((sum, stat) => sum + parseFloat(stat.average_attendance_percentage || 0), 0) / attendanceStats.length).toFixed(1)
              : 0}%
          </div>
          <div className="stat-label">Average Attendance Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{studentParticipation.length}</div>
          <div className="stat-label">Active Students</div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
