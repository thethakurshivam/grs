import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  LogOut, 
  TrendingUp,
  Activity,
  Bell
} from 'lucide-react';
import { usePOCCourses } from '../hooks/usePOCCourses';
import { usePOCMOUs } from '../hooks/usePOCMOUs';
import { usePOCStudents } from '../hooks/usePOCStudents';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const navigate = useNavigate();
  const { count: coursesCount, courses, loading: coursesLoading, error: coursesError, fetchCourses } = usePOCCourses();
  const { count: mousCount, mous, loading: mousLoading, error: mousError, fetchMOUs } = usePOCMOUs();
  const { count: studentsCount, students, loading: studentsLoading, error: studentsError, fetchStudents } = usePOCStudents();

  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    mous: 0,
    requests: 8
  });

  useEffect(() => {
    const pocUser = JSON.parse(localStorage.getItem('pocUser') || '{}');
    const pocId = pocUser?.id || user?.id || '1';
    fetchCourses(String(pocId));
    fetchMOUs(String(pocId));
    fetchStudents(String(pocId));
  }, [fetchCourses, fetchMOUs, fetchStudents, user]);

  useEffect(() => {
    setStats((s) => ({ ...s, courses: coursesLoading ? 0 : coursesCount }));
  }, [coursesCount, coursesLoading]);

  useEffect(() => {
    setStats((s) => ({ ...s, mous: mousLoading ? 0 : mousCount }));
  }, [mousCount, mousLoading]);

  useEffect(() => {
    setStats((s) => ({ ...s, students: studentsLoading ? 0 : studentsCount }));
  }, [studentsCount, studentsLoading]);

  const dashboardCards = [
    {
      title: "Students",
      value: studentsLoading ? 'Loading...' : studentsError ? 'Error' : stats.students,
      description: "Total registered students",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/students"
    },
    {
      title: "Courses",
      value: coursesLoading ? 'Loading...' : coursesError ? 'Error' : stats.courses,
      description: "Active courses available",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
      path: "/courses"
    },
    {
      title: "MOUs",
      value: mousLoading ? 'Loading...' : mousError ? 'Error' : stats.mous,
      description: "Memorandum of Understanding",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      path: "/mous"
    },
    {
      title: "Requests",
      value: stats.requests,
      description: "Pending approval requests",
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      path: "/requests"
    }
  ];

  const handleCardClick = (path: string) => {
    if (path === '/courses') {
      navigate('/courses', { state: { coursesFromBackend: courses } });
    } else if (path === '/mous') {
      navigate('/mous', { state: { mousFromBackend: mous } });
    } else if (path === '/students') {
      navigate('/students', { state: { studentsFromBackend: students } });
    } else {
      navigate(path);
    }
  };

  const recentActivities = [
    { id: 1, action: "New student registration", time: "2 minutes ago", type: "student" },
    { id: 2, action: "Course completion certificate", time: "15 minutes ago", type: "course" },
    { id: 3, action: "MOU renewal request", time: "1 hour ago", type: "mou" },
    { id: 4, action: "Approval request submitted", time: "2 hours ago", type: "request" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">POC Portal Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your portal today.
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick(card.path)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">+12.5%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm font-medium text-gray-900">247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Status</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 