import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentDashboardLayout } from './StudentDashboardLayout';

export const BPRNDStudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Get student data from localStorage with fallbacks
  const studentName = localStorage.getItem('studentName') || 'Officer John Doe';
  const studentDesignation = localStorage.getItem('studentDesignation') || 'Police Officer';
  const studentState = localStorage.getItem('studentState') || 'Maharashtra';
  const studentUmbrella = localStorage.getItem('studentUmbrella') || 'Cyber Security';

  const handleProfileCardClick = () => {
    navigate('/student/bprnd/profile-api');
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BPRND Student Dashboard</h1>
          <p className="text-gray-700 mt-2">
            Welcome to your BPRND portal! Access your profile and training information.
          </p>
        </div>

        <div className="flex justify-center">
          <Card 
            className="w-80 h-48 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleProfileCardClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Your Profile
              </CardTitle>
              <UserCircle className="h-5 w-5 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium">{studentName}</p>
                <p className="text-gray-600">{studentDesignation} | {studentState} Police</p>
                <div className="mt-3 space-y-1">
                  <p className="text-xs">• Training Hours: 120 hrs</p>
                  <p className="text-xs">• Credits Earned: 45</p>
                  <p className="text-xs">• Umbrella: {studentUmbrella}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};