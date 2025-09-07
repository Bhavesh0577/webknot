import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import components
import Dashboard from './components/Dashboard';
import Colleges from './components/Colleges';
import Events from './components/Events';
import Students from './components/Students';
import Reports from './components/Reports';

function App() {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <Router>
      <div className="app">
        {/* Sidebar Navigation */}
        <nav className="sidebar">
          <div className="sidebar-header">
            <h2>🎓 Campus Events</h2>
            <p>Admin Portal</p>
          </div>
          
          <ul className="nav-menu">
            <li>
              <Link 
                to="/" 
                className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveNav('dashboard')}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/colleges" 
                className={`nav-link ${activeNav === 'colleges' ? 'active' : ''}`}
                onClick={() => setActiveNav('colleges')}
              >
                <span className="nav-icon">🏫</span>
                Colleges
              </Link>
            </li>
            <li>
              <Link 
                to="/events" 
                className={`nav-link ${activeNav === 'events' ? 'active' : ''}`}
                onClick={() => setActiveNav('events')}
              >
                <span className="nav-icon">📅</span>
                Events
              </Link>
            </li>
            <li>
              <Link 
                to="/students" 
                className={`nav-link ${activeNav === 'students' ? 'active' : ''}`}
                onClick={() => setActiveNav('students')}
              >
                <span className="nav-icon">🎓</span>
                Students
              </Link>
            </li>
            <li>
              <Link 
                to="/reports" 
                className={`nav-link ${activeNav === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveNav('reports')}
              >
                <span className="nav-icon">📈</span>
                Reports
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/events" element={<Events />} />
            <Route path="/students" element={<Students />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
