import React from 'react';
import { StudentDashboardLayout } from '../components/student/StudentDashboardLayout';
import { ProfilePage } from '../components/student/ProfilePage';

const StudentProfile: React.FC = () => {
  return (
    <StudentDashboardLayout>
      <ProfilePage />
    </StudentDashboardLayout>
  );
};

export default StudentProfile; 