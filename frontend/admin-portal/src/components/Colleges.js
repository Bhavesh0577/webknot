import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [newCollege, setNewCollege] = useState({
    college_id: '',
    college_name: '',
    location: '',
    contact_email: ''
  });

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/colleges`);
      const collegesData = response.data.data || response.data;
      setColleges(Array.isArray(collegesData) ? collegesData : []);
    } catch (error) {
      console.error('Failed to load colleges:', error);
      setColleges([]); // Ensure colleges is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCollege(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/colleges`, newCollege);
      setShowModal(false);
      setNewCollege({
        college_id: '',
        college_name: '',
        location: '',
        contact_email: ''
      });
      await loadColleges();
      alert('College added successfully!');
    } catch (error) {
      console.error('Failed to add college:', error);
      alert('Failed to add college. Please check if College ID already exists.');
    }
  };

  const viewCollegeDetails = async (collegeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/colleges/${collegeId}`);
      const college = response.data;
      
      const message = `College Details:

Name: ${college.college_name}
ID: ${college.college_id}
Location: ${college.location}
Contact: ${college.contact_email}
Total Events: ${college.stats?.total_events || 0}
Total Students: ${college.stats?.total_students || 0}`;

      alert(message);
    } catch (error) {
      console.error('Failed to load college details:', error);
      alert('Failed to load college details');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div>Loading colleges...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h1>Colleges Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add College
        </button>
      </div>

      {/* Colleges Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>College Name</th>
              <th>College ID</th>
              <th>Location</th>
              <th>Contact Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges && colleges.length > 0 ? (
              colleges.map((college) => (
                <tr key={college.college_id}>
                  <td>{college.college_name}</td>
                  <td>{college.college_id}</td>
                  <td>{college.location}</td>
                  <td>{college.contact_email}</td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => viewCollegeDetails(college.college_id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No colleges found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* College Stats Cards */}
      <div className="grid grid-3 mt-4">
        {colleges && colleges.length > 0 && colleges.map((college) => (
          <div key={college.college_id} className="card">
            <div className="card-header">
              <h3 className="card-title">{college.college_name}</h3>
            </div>
            <div>
              <div className="flex-between mb-2">
                <span>Location:</span>
                <span className="text-secondary">{college.location}</span>
              </div>
              <div className="flex-between mb-2">
                <span>Contact:</span>
                <span className="text-secondary">{college.contact_email}</span>
              </div>
              <div className="flex-between">
                <span>College ID:</span>
                <span className="badge badge-primary">{college.college_id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add College Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New College</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="grid grid-2">
                <div>
                  <label className="form-label">College ID</label>
                  <input
                    type="text"
                    name="college_id"
                    className="form-input"
                    value={newCollege.college_id}
                    onChange={handleInputChange}
                    placeholder="e.g., COL001"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">College Name</label>
                  <input
                    type="text"
                    name="college_name"
                    className="form-input"
                    value={newCollege.college_name}
                    onChange={handleInputChange}
                    placeholder="e.g., ABC Engineering College"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    value={newCollege.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Mumbai, Maharashtra"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    className="form-input"
                    value={newCollege.contact_email}
                    onChange={handleInputChange}
                    placeholder="e.g., admin@abcengineering.edu"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Colleges;
