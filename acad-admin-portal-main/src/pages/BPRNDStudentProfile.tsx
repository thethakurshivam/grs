import React from 'react';
import { StudentDashboardLayout } from '../components/student/StudentDashboardLayout';
import { BPRNDProfilePage } from '../components/student/BPRNDProfilePage';

const BPRNDStudentProfile: React.FC = () => {
  return (
    <StudentDashboardLayout>
      <BPRNDProfilePage />
    </StudentDashboardLayout>
  );
};

export default BPRNDStudentProfile;
