import React from 'react';
import { StudentDashboardLayout } from '../components/student/StudentDashboardLayout';
import { StudentDashboardOverview } from '../components/student/StudentDashboardOverview';

interface StudentDashboardProps {
  isBPRND?: boolean;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  isBPRND = false,
}) => {
  return (
    <StudentDashboardLayout>
      <StudentDashboardOverview isBPRND={isBPRND} />
    </StudentDashboardLayout>
  );
};

export default StudentDashboard;
