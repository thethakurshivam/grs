import React from 'react';
import StudentSignupPage from '../components/student/StudentSignupPage';

interface StudentSignupProps {
  isBPRND?: boolean;
}

const StudentSignup: React.FC<StudentSignupProps> = ({ isBPRND = false }) => {
  return <StudentSignupPage />;
};

export default StudentSignup;
