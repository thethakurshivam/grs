import React from 'react';
import { StudentDashboardSidebar } from './StudentDashboardSidebar';

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
}

export const StudentDashboardLayout: React.FC<StudentDashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <StudentDashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}; 