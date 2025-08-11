import React from 'react';
import StudentLoginPage from '../components/student/StudentLoginPage';

interface StudentLoginProps {
  isBPRND?: boolean;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ isBPRND = false }) => {
  return <StudentLoginPage isBPRND={isBPRND} />;
};

export default StudentLogin;
