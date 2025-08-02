import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  User,
  LogOut 
} from 'lucide-react';

export const StudentDashboardSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: User,
      path: '/student/dashboard',
    },
    {
      name: 'Available Courses',
      icon: BookOpen,
      path: '/student/available-courses',
    },
    {
      name: 'Completed Courses',
      icon: GraduationCap,
      path: '/student/completed-courses',
    },
    {
      name: 'Credit Bank',
      icon: CreditCard,
      path: '/student/credit-bank',
    },
  ];

  return (
    <div className="w-64 bg-sidebar-background shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sidebar-foreground">Student Portal</h1>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4">
        <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-sidebar-foreground rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}; 