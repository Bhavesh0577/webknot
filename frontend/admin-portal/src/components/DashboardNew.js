import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Calendar, 
  Users, 
  CheckCircle,
  TrendingUp,
  Clock,
  Star,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/Progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';

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
      console.log('Loading dashboard data...');
      
      const [collegesRes, eventsRes, topStudentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/colleges`),
        axios.get(`${API_BASE_URL}/events`),
        axios.get(`${API_BASE_URL}/reports/top-students`)
      ]);

      const colleges = collegesRes.data.data || collegesRes.data;
      const events = eventsRes.data.data || eventsRes.data;
      const students = topStudentsRes.data.data || topStudentsRes.data;

      console.log('Dashboard data loaded:', {
        colleges: colleges?.length || 0,
        events: events?.length || 0,
        students: students?.length || 0,
        sampleEvent: events?.[0],
        sampleStudent: students?.[0]
      });

      setStats({
        totalColleges: Array.isArray(colleges) ? colleges.length : 0,
        totalEvents: Array.isArray(events) ? events.length : 0,
        activeEvents: Array.isArray(events) ? events.filter(e => e.status === 'active').length : 0,
        completedEvents: Array.isArray(events) ? events.filter(e => e.status === 'completed').length : 0
      });

      setRecentEvents(Array.isArray(events) ? events.slice(0, 5) : []);
      setTopStudents(Array.isArray(students) ? students.slice(0, 5) : []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setRecentEvents([]);
      setTopStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Colleges',
      value: stats.totalColleges,
      icon: Building2,
      gradient: 'from-blue-500 to-blue-600',
      change: '+2.5%'
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-600',
      change: '+12.3%'
    },
    {
      title: 'Active Events',
      value: stats.activeEvents,
      icon: Activity,
      gradient: 'from-green-500 to-green-600',
      change: '+8.1%'
    },
    {
      title: 'Completed Events',
      value: stats.completedEvents,
      icon: CheckCircle,
      gradient: 'from-orange-500 to-orange-600',
      change: '+15.2%'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <div className="flex items-center mt-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">
                          {stat.change}
                        </span>
                        <span className="text-gray-500 ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span>Recent Events</span>
              </CardTitle>
              <CardDescription>
                Latest events in your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => (
                    <motion.div
                      key={event.event_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {event.event_name}
                        </h4>
                        <p className="text-sm text-gray-500 mb-2">
                          {event.event_description?.substring(0, 50)}...
                        </p>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(event.event_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={event.status === 'active' ? 'success' : 'secondary'}
                        className="ml-4"
                      >
                        {event.status}
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No events available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span>Top Active Students</span>
              </CardTitle>
              <CardDescription>
                Most engaged students in events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topStudents.length > 0 ? (
                  topStudents.map((student, index) => (
                    <motion.div
                      key={student.student_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.student_name}`} />
                          <AvatarFallback>{student.student_name?.charAt(0) || 'S'}</AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {student.student_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {student.email}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Events Attended</span>
                            <span>{student.events_attended || 0}</span>
                          </div>
                          <Progress 
                            value={Math.min((student.events_attended || 0) * 10, 100)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No student data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
