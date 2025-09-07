import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentPortal from './components/StudentPortalNew';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/*" element={<StudentPortal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
