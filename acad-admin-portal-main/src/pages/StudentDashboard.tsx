import React from 'react';
import { StudentDashboardLayout } from '../components/student/StudentDashboardLayout';
import { StudentDashboardOverview } from '../components/student/StudentDashboardOverview';

const StudentDashboard: React.FC = () => {
  return (
    <StudentDashboardLayout>
      <StudentDashboardOverview />
    </StudentDashboardLayout>
  );
};

export default StudentDashboard; 