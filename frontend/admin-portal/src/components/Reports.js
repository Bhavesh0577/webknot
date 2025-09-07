import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Building2,
  Award,
  Activity,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';

const API_BASE_URL = 'http://localhost:3000/api';

function Reports() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    popularEvents: [],
    topStudents: [],
    collegeStats: [],
    eventAttendance: [],
    feedback: []
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      console.log('Fetching reports data...');
      const [popularEvents, topStudents, attendanceStats, feedback] = await Promise.all([
        axios.get(`${API_BASE_URL}/reports/event-popularity`),
        axios.get(`${API_BASE_URL}/reports/top-students`),
        axios.get(`${API_BASE_URL}/reports/attendance-stats`),
        axios.get(`${API_BASE_URL}/reports/feedback`)
      ]);

      // For college stats, we'll derive it from other data or make a separate call
      const collegesResponse = await axios.get(`${API_BASE_URL}/colleges`);
      const colleges = collegesResponse.data.data || collegesResponse.data || [];

      console.log('Reports data fetched successfully:', {
        popularEvents: popularEvents.data,
        topStudents: topStudents.data,
        colleges: colleges.length,
        attendanceStats: attendanceStats.data,
        feedback: feedback.data
      });

      setReportData({
        popularEvents: Array.isArray(popularEvents.data.data || popularEvents.data) ? (popularEvents.data.data || popularEvents.data) : [],
        topStudents: Array.isArray(topStudents.data.data || topStudents.data) ? (topStudents.data.data || topStudents.data) : [],
        collegeStats: Array.isArray(colleges) ? colleges : [],
        eventAttendance: Array.isArray(attendanceStats.data.data || attendanceStats.data) ? (attendanceStats.data.data || attendanceStats.data) : [],
        feedback: Array.isArray(feedback.data.data || feedback.data) ? (feedback.data.data || feedback.data) : []
      });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set empty arrays on error
      setReportData({
        popularEvents: [],
        topStudents: [],
        collegeStats: [],
        eventAttendance: [],
        feedback: []
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <Card className={`border-l-4 border-l-${color}-500`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {change > 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
          <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <p className="text-gray-600">Track performance and insights</p>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalEvents = reportData.popularEvents.length;
  const totalStudents = reportData.topStudents.length;
  const totalColleges = reportData.collegeStats.length;
  const avgAttendance = reportData.eventAttendance.length > 0 
    ? Math.round(reportData.eventAttendance.reduce((sum, event) => sum + (event.attendance || 0), 0) / reportData.eventAttendance.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Track performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={fetchReports} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={totalEvents}
          change={12}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Active Students"
          value={totalStudents}
          change={8}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Colleges"
          value={totalColleges}
          change={0}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Avg Attendance"
          value={`${avgAttendance}%`}
          change={5}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Main Reports */}
      <Tabs defaultValue="popular-events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="popular-events">Popular Events</TabsTrigger>
          <TabsTrigger value="top-students">Top Students</TabsTrigger>
          <TabsTrigger value="college-stats">College Stats</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="popular-events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Most Popular Events
              </CardTitle>
              <CardDescription>Events ranked by registration and attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.popularEvents.length > 0 ? (
                  reportData.popularEvents.map((event, index) => (
                    <motion.div
                      key={event.event_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{event.event_name}</h3>
                          <p className="text-sm text-gray-500">{event.event_type} • {event.college_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{event.total_registrations || 0}</p>
                        <p className="text-sm text-gray-500">Registrations</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No event data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-gold-500" />
                Most Active Students
              </CardTitle>
              <CardDescription>Students ranked by event participation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topStudents.length > 0 ? (
                  reportData.topStudents.map((student, index) => (
                    <motion.div
                      key={student.student_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-600' : 
                          'bg-blue-500'
                        } flex items-center justify-center text-white font-bold`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{student.student_name}</h3>
                          <p className="text-sm text-gray-500">{student.college_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{student.total_events || 0}</p>
                        <p className="text-sm text-gray-500">Events Attended</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No student data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="college-stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportData.collegeStats.length > 0 ? (
              reportData.collegeStats.map((college, index) => (
                <motion.div
                  key={college.college_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                        {college.college_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{college.total_events || 0}</div>
                          <div className="text-xs text-gray-500">Events</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{college.total_students || 0}</div>
                          <div className="text-xs text-gray-500">Students</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{college.total_registrations || 0}</div>
                          <div className="text-xs text-gray-500">Registrations</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No college statistics available</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Event Attendance
              </CardTitle>
              <CardDescription>Attendance rates across events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.eventAttendance.length > 0 ? (
                  reportData.eventAttendance.map((event, index) => (
                    <motion.div
                      key={event.event_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{event.event_name}</h3>
                        <p className="text-sm text-gray-500">
                          {event.attended || 0} of {event.registered || 0} attended
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${event.registered > 0 ? (event.attended / event.registered) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <Badge className={`${
                          (event.attended / event.registered) * 100 > 75 ? 'bg-green-500' :
                          (event.attended / event.registered) * 100 > 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        } hover:opacity-90`}>
                          {event.registered > 0 ? Math.round((event.attended / event.registered) * 100) : 0}%
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No attendance data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                Event Feedback
              </CardTitle>
              <CardDescription>Feedback and ratings from participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.feedback.length > 0 ? (
                  reportData.feedback.map((feedback, index) => (
                    <motion.div
                      key={feedback.feedback_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{feedback.event_name}</h3>
                          <p className="text-sm text-gray-500">by {feedback.student_name}</p>
                        </div>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (feedback.rating || 0) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({feedback.rating}/5)</span>
                        </div>
                      </div>
                      {feedback.comments && (
                        <p className="text-sm text-gray-700 italic">"{feedback.comments}"</p>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No feedback data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Reports;
