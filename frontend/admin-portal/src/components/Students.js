import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

function Students() {
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    college_id: '',
    department: ''
  });

  const [newStudent, setNewStudent] = useState({
    student_name: '',
    email: '',
    phone: '',
    department: '',
    year_of_study: 1,
    college_id: ''
  });

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics',
    'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology',
    'MBA', 'BBA', 'Commerce', 'Arts', 'Science'
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const collegesRes = await axios.get(`${API_BASE_URL}/colleges`);
      const collegesData = collegesRes.data.data || collegesRes.data;
      setColleges(Array.isArray(collegesData) ? collegesData : []);
      await loadStudents();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      let url = `${API_BASE_URL}/students`;
      
      if (filters.college_id) {
        // If a specific college is selected, use the college-specific endpoint
        url = `${API_BASE_URL}/students/college/${filters.college_id}`;
        if (filters.department) {
          url += `?department=${filters.department}`;
        }
      } else if (filters.department) {
        // If no college selected but department is selected, add department filter to general endpoint
        url += `?department=${filters.department}`;
      }

      const response = await axios.get(url);
      const studentsData = response.data.data || response.data;
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Failed to load students:', error);
      setStudents([]);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/students`, newStudent);
      setShowModal(false);
      setNewStudent({
        student_name: '',
        email: '',
        phone: '',
        department: '',
        year_of_study: 1,
        college_id: ''
      });
      await loadStudents();
      alert('Student added successfully!');
    } catch (error) {
      console.error('Failed to add student:', error);
      alert('Failed to add student. Please try again.');
    }
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div>Loading students...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h1>Students Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Filters</h3>
        </div>
        <div className="grid grid-2">
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
            <label className="form-label">Department</label>
            <select
              className="form-input"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Year</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students && students.length > 0 ? (
              students.map((student) => (
                <tr key={student.student_id}>
                  <td>{student.student_name}</td>
                  <td>{student.email}</td>
                  <td>{student.department}</td>
                  <td>{student.year_of_study}{getOrdinalSuffix(student.year_of_study)} Year</td>
                  <td>{student.phone}</td>
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
                <td colSpan="6" className="text-center">No students found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New Student</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="grid grid-2">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="student_name"
                    className="form-input"
                    value={newStudent.student_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={newStudent.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={newStudent.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Department</label>
                  <select
                    name="department"
                    className="form-input"
                    value={newStudent.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Year of Study</label>
                  <select
                    name="year_of_study"
                    className="form-input"
                    value={newStudent.year_of_study}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">College</label>
                  <select
                    name="college_id"
                    className="form-input"
                    value={newStudent.college_id}
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
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
