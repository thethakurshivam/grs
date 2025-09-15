import React from 'react';
import { StudentDashboardLayout } from '../components/student/StudentDashboardLayout';
import { BPRNDProfileAPIPage } from '../components/student/BPRNDProfileAPIPage';

const BPRNDStudentProfileAPI: React.FC = () => {
  return (
    <StudentDashboardLayout>
      <BPRNDProfileAPIPage />
    </StudentDashboardLayout>
  );
};

export default BPRNDStudentProfileAPI;
