import React from 'react';
import { StudentDashboardLayout } from '../components/student/StudentDashboardLayout';
import { CreditBankPage as BprndCreditBankPage } from '../components/student/CreditBankPage';
import { useLocation } from 'react-router-dom';
import NormalCreditBankPage from '../components/student/NormalCreditBankPage';

const StudentCreditBank: React.FC = () => {
  const location = useLocation();
  const isBprnd = location.pathname.startsWith('/student/bprnd');

  return (
    <StudentDashboardLayout>
      {isBprnd ? <BprndCreditBankPage /> : <NormalCreditBankPage />}
    </StudentDashboardLayout>
  );
};

export default StudentCreditBank; 