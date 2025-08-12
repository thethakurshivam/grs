import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut,
  Plus
} from 'lucide-react';

export const StudentDashboardSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all student-related data from localStorage
    localStorage.removeItem('isStudentAuthenticated');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentId');
    
    // Navigate to landing page
    navigate('/');
  };

  const handleAddCourseOtherThanRRU = () => {
    navigate('/student/previous-courses');
  };

  const menuItems: Array<{
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    onClick?: () => void;
  }> = [
    {
      name: 'Add Course Other Than RRU',
      icon: Plus,
      path: '/student/add-course-other-than-rru',
      onClick: handleAddCourseOtherThanRRU,
    },
  ];

  return (
    <div className="w-64 bg-sidebar-background shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Portal</h1>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-sidebar-accent hover:text-gray-900 transition-colors"
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-sidebar-accent hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}; 