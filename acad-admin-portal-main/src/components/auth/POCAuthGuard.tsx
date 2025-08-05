import React from 'react';
import { Navigate } from 'react-router-dom';

interface POCAuthGuardProps {
  children: React.ReactNode;
}

const POCAuthGuard: React.FC<POCAuthGuardProps> = ({ children }) => {
  const isPOCAuthenticated = localStorage.getItem('isPOCAuthenticated') === 'true';
  const pocToken = localStorage.getItem('pocToken');
  const pocUserId = localStorage.getItem('pocUserId');

  if (!isPOCAuthenticated || !pocToken || !pocUserId) {
    // Redirect to POC login if not authenticated
    return <Navigate to="/poc/login" replace />;
  }

  return <>{children}</>;
};

export default POCAuthGuard; 