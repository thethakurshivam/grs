import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Activity,
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { usePOCCourses } from '../hooks/usePOCCourses';
import { usePOCMOUs } from '../hooks/usePOCMOUs';
import { usePOCStudents } from '../hooks/usePOCStudents';
import Sidebar from './Sidebar';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
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
      title: "Total Students",
      value: studentsLoading ? '...' : studentsError ? 'Error' : stats.students,
      description: "Registered students",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      path: "/students"
    },
    {
      title: "Active Courses",
      value: coursesLoading ? '...' : coursesError ? 'Error' : stats.courses,
      description: "Available courses",
      icon: BookOpen,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      path: "/courses"
    },
    {
      title: "MOUs",
      value: mousLoading ? '...' : mousError ? 'Error' : stats.mous,
      description: "Memorandum of Understanding",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      path: "/mous"
    },
    {
      title: "Pending Requests",
      value: stats.requests,
      description: "Awaiting approval",
      icon: MessageSquare,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
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
    { 
      id: 1, 
      action: "New student registration", 
      time: "2 minutes ago", 
      type: "student",
      status: "completed",
      icon: Users
    },
    { 
      id: 2, 
      action: "Course completion certificate", 
      time: "15 minutes ago", 
      type: "course",
      status: "completed",
      icon: CheckCircle
    },
    { 
      id: 3, 
      action: "MOU renewal request", 
      time: "1 hour ago", 
      type: "mou",
      status: "pending",
      icon: AlertCircle
    },
    { 
      id: 4, 
      action: "Approval request submitted", 
      time: "2 hours ago", 
      type: "request",
      status: "pending",
      icon: Clock
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'pending':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} onLogout={onLogout} currentPath={location.pathname} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="h-5 w-5 text-slate-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-slate-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.organization}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className={`stat-card border-l-4 ${card.borderColor} hover:shadow-lg transition-all duration-200`}
                  onClick={() => handleCardClick(card.path)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mb-1">{card.value}</p>
                      <p className="text-sm text-slate-500">{card.description}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${card.bgColor}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 card-elevated">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                <button className="text-sm text-slate-600 hover:text-slate-900 font-medium">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status).split(' ')[1]}`}>
                        <Icon className={`h-4 w-4 ${getStatusColor(activity.status).split(' ')[0]}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                        <p className="text-xs text-slate-500 flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{activity.time}</span>
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card-elevated">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Quick Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Growth Rate</span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">+12.5%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Active Sessions</span>
                  <span className="text-sm font-medium text-slate-900">247</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">System Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-emerald-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Last Updated</span>
                  <span className="text-sm font-medium text-slate-900">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 