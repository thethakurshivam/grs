import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StudentDashboardSidebar } from './StudentDashboardSidebar';

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
}

export const StudentDashboardLayout: React.FC<StudentDashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isBprnd = location.pathname.startsWith('/student/bprnd');

    // Choose keys per portal
    const isAuthenticated = isBprnd
      ? localStorage.getItem('bprndIsAuthenticated')
      : localStorage.getItem('isStudentAuthenticated');

    const token = isBprnd
      ? localStorage.getItem('bprndStudentToken')
      : localStorage.getItem('studentToken');

    if (!isAuthenticated || !token) {
      navigate(isBprnd ? '/student/bprnd/login' : '/student/login');
      return;
    }
  }, [location.pathname, navigate]);

  const isBprnd = location.pathname.startsWith('/student/bprnd');

  return (
    <div className={`flex h-screen ${isBprnd ? 'bg-blue-50' : 'bg-gray-50'} text-black`}>
      <StudentDashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}; 