import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface POCAuthGuardProps {
  children: React.ReactNode;
}

const POCAuthGuard: React.FC<POCAuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const isPOCAuthenticated = localStorage.getItem('isPOCAuthenticated') === 'true';
  const pocToken = localStorage.getItem('pocToken');
  const pocUserId = localStorage.getItem('pocUserId');

  if (!isPOCAuthenticated || !pocToken || !pocUserId) {
    // Redirect to the appropriate POC login based on current path
    const isBprndPath = location.pathname.startsWith('/poc-portal/bprnd');
    return <Navigate to={isBprndPath ? '/poc/bprnd/login' : '/poc/login'} replace />;
  }

  return <>{children}</>;
};

export default POCAuthGuard; 