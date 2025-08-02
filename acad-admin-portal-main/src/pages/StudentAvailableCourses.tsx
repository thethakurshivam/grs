import React from 'react';
import { StudentDashboardLayout } from '../components/student/StudentDashboardLayout';
import { AvailableCoursesPage } from '../components/student/AvailableCoursesPage';

const StudentAvailableCourses: React.FC = () => {
  return (
    <StudentDashboardLayout>
      <AvailableCoursesPage />
    </StudentDashboardLayout>
  );
};

export default StudentAvailableCourses; 