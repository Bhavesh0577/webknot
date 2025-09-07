import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  Users, 
  BarChart3,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';

// Import components
import Dashboard from './components/DashboardNew';
import Colleges from './components/Colleges';
import Events from './components/Events';
import Students from './components/Students';
import Reports from './components/Reports';

function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { 
      id: 'dashboard', 
      path: '/', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      color: 'text-blue-500'
    },
    { 
      id: 'colleges', 
      path: '/colleges', 
      label: 'Colleges', 
      icon: Building2,
      color: 'text-emerald-500'
    },
    { 
      id: 'events', 
      path: '/events', 
      label: 'Events', 
      icon: Calendar,
      color: 'text-purple-500'
    },
    { 
      id: 'students', 
      path: '/students', 
      label: 'Students', 
      icon: Users,
      color: 'text-orange-500'
    },
    { 
      id: 'reports', 
      path: '/reports', 
      label: 'Reports', 
      icon: BarChart3,
      color: 'text-red-500'
    },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-50/50 flex">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className="w-72 bg-white shadow-xl border-r border-gray-200 hidden lg:flex lg:flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Campus Events</h2>
                <p className="text-sm text-gray-500">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-4 py-6 flex-1">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        setActiveNav(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon 
                        className={`w-5 h-5 transition-colors duration-200 ${
                          isActive ? 'text-blue-600' : item.color
                        }`} 
                      />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@campus.edu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        <motion.nav
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : '-100%',
          }}
          className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-gray-200 lg:hidden"
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Campus Events</h2>
                <p className="text-sm text-gray-500">Admin Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        setActiveNav(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon 
                        className={`w-5 h-5 transition-colors duration-200 ${
                          isActive ? 'text-blue-600' : item.color
                        }`} 
                      />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@campus.edu</p>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {navItems.find(item => item.id === activeNav)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage your campus events efficiently
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/colleges" element={<Colleges />} />
                <Route path="/events" element={<Events />} />
                <Route path="/students" element={<Students />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </motion.div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
