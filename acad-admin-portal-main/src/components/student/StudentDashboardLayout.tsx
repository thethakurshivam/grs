import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentDashboardSidebar } from './StudentDashboardSidebar';

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
}

export const StudentDashboardLayout: React.FC<StudentDashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if student is authenticated
    const isAuthenticated = localStorage.getItem('isStudentAuthenticated');
    const studentToken = localStorage.getItem('studentToken');
    
    if (!isAuthenticated || !studentToken) {
      navigate('/student/login');
      return;
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-blue-50 text-black">
      <StudentDashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}; 