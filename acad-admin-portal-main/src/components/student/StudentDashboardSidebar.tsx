import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut,
  Plus,
  Award,
  BadgeCheck,
  ExternalLink,
  Home,
  BookOpen,
  CreditCard,
  User,
  ClipboardList
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const StudentDashboardSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isBprnd = location.pathname.startsWith('/student/bprnd');

  const handleLogout = () => {
    // Clear normal student session
    localStorage.removeItem('isStudentAuthenticated');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentId');

    // Clear BPR&D session
    localStorage.removeItem('bprndIsAuthenticated');
    localStorage.removeItem('bprndStudentToken');
    localStorage.removeItem('bprndStudentId');

    toast({ title: 'Logged out', description: 'You have been signed out.' });
    navigate('/');
  };

  // BPR&D handlers
  const handleAddCourseOtherThanRRU = () => {
    navigate('/student/bprnd/previous-courses');
  };
  const handleCertifications = () => {
    navigate('/student/bprnd/certifications');
  };
  const handleClaimCredits = () => {
    navigate('/student/bprnd/claim-credits');
  };
  const handleRise = () => {
    toast({ title: 'Redirecting', description: 'Opening RISE portal...' });
    setTimeout(() => {
      window.open('https://rise.rru.ac.in/', '_blank', 'noopener');
    }, 900);
  };
  const handleBprndDashboard = () => {
    navigate('/student/bprnd/dashboard');
  };
  const handleTrainingCalendar = () => {
    navigate('/student/bprnd/training-calendar');
  };
  const handleBprndCreditBank = () => {
    navigate('/student/bprnd/credit-bank');
  };
  const handleBprndMyRequests = () => {
    navigate('/student/bprnd/claims');
  };

  // Normal student handlers
  const handleStudentDashboard = () => {
    navigate('/student/dashboard');
  };
  const handleAvailableCourses = () => {
    navigate('/student/available-courses');
  };
  const handleCompletedCourses = () => {
    navigate('/student/completed-courses');
  };
  const handleStudentCreditBank = () => {
    navigate('/student/credit-bank');
  };
  const handleStudentProfile = () => {
    navigate('/student/profile');
  };

  const bprndMenuItems: Array<{
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    path: string;
  }> = [
    { name: 'Dashboard', icon: Home, onClick: handleBprndDashboard, path: '/student/bprnd/dashboard' },
    { name: 'Add courses', icon: Plus, onClick: handleAddCourseOtherThanRRU, path: '/student/bprnd/previous-courses' },
    { name: 'Training Calendar', icon: ExternalLink, onClick: handleTrainingCalendar, path: '/student/bprnd/training-calendar' },
    { name: 'Certifications', icon: Award, onClick: handleCertifications, path: '/student/bprnd/certifications' },
    { name: 'Claim Credits', icon: BadgeCheck, onClick: handleClaimCredits, path: '/student/bprnd/claim-credits' },
    { name: 'Credit Bank', icon: CreditCard, onClick: handleBprndCreditBank, path: '/student/bprnd/credit-bank' },
    { name: 'My Certification Requests', icon: ClipboardList, onClick: handleBprndMyRequests, path: '/student/bprnd/claims' },
    { name: 'Rise', icon: ExternalLink, onClick: handleRise, path: '/student/bprnd/rise' },
  ];

  const studentMenuItems: Array<{
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    path: string;
  }> = [
    { name: 'Dashboard', icon: Home, onClick: handleStudentDashboard, path: '/student/dashboard' },
    { name: 'Available Courses', icon: BookOpen, onClick: handleAvailableCourses, path: '/student/available-courses' },
    { name: 'Completed Courses', icon: Award, onClick: handleCompletedCourses, path: '/student/completed-courses' },
    { name: 'Credit Bank', icon: CreditCard, onClick: handleStudentCreditBank, path: '/student/credit-bank' },
    { name: 'Profile', icon: User, onClick: handleStudentProfile, path: '/student/profile' },
  ];

  const menuItems = isBprnd ? bprndMenuItems : studentMenuItems;

  return (
    <div className={`w-64 border-r ${isBprnd ? 'bg-gray-100 border-gray-300' : 'bg-sidebar-background'}`}>
      <div className="p-6 border-b border-gray-200">
        <h1 className={`text-xl font-semibold ${isBprnd ? 'text-gray-900' : 'text-gray-800'}`}>
          {isBprnd ? 'BPR&D Trainee' : 'Student'} Portal
        </h1>
      </div>
      
      <nav className="mt-4">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isBprnd 
                    ? (isActive 
                        ? 'bg-gray-200 text-gray-900 border border-gray-300' 
                        : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900')
                    : (isActive 
                        ? 'bg-sidebar-accent text-gray-900' 
                        : 'text-gray-700 hover:bg-sidebar-accent hover:text-gray-900')
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${isBprnd ? 'text-gray-600' : ''}`} />
                {item.name}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            isBprnd 
              ? 'text-gray-700 hover:bg-gray-200 hover:text-gray-900' 
              : 'text-gray-700 hover:bg-sidebar-accent hover:text-gray-900'
          }`}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}; 