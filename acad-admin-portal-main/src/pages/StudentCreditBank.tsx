import React from 'react';
import { StudentDashboardLayout } from '../components/student/StudentDashboardLayout';
import { CreditBankPage } from '../components/student/CreditBankPage';

const StudentCreditBank: React.FC = () => {
  return (
    <StudentDashboardLayout>
      <CreditBankPage />
    </StudentDashboardLayout>
  );
};

export default StudentCreditBank; 