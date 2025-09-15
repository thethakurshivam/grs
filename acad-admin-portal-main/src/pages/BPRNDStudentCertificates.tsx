import React from 'react';
import { StudentDashboardLayout } from '../components/student/StudentDashboardLayout';
import { BPRNDCertificatesPage } from '../components/student/BPRNDCertificatesPage';

const BPRNDStudentCertificates: React.FC = () => {
  return (
    <StudentDashboardLayout>
      <BPRNDCertificatesPage />
    </StudentDashboardLayout>
  );
};

export default BPRNDStudentCertificates;
