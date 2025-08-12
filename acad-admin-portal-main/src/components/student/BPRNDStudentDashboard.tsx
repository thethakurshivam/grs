import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserCircle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentDashboardLayout } from './StudentDashboardLayout';
import useBPRNDStudentCredits from '@/hooks/useBPRNDStudentCredits';

export const BPRNDStudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Get student data from localStorage with fallbacks
  const studentName = localStorage.getItem('studentName') || 'Officer John Doe';
  const studentDesignation = localStorage.getItem('studentDesignation') || 'Police Officer';
  const studentState = localStorage.getItem('studentState') || 'Maharashtra';
  const studentUmbrella = localStorage.getItem('studentUmbrella') || 'Cyber Security';
  // Prefer ID from stored BPRND student object; fallback to explicit keys
  const storedBprnd = localStorage.getItem('bprndStudentData');
  let derivedId: string | null = null;
  try {
    if (storedBprnd) {
      const parsed = JSON.parse(storedBprnd);
      derivedId = parsed?._id || null;
    }
  } catch (_) {
    // ignore JSON parse errors
  }
  const studentId = derivedId || localStorage.getItem('bprndStudentId') || localStorage.getItem('studentId');
  const { totalCredits, isLoading, error } = useBPRNDStudentCredits(studentId);

  const handleProfileCardClick = () => {
    navigate('/student/bprnd/profile-api');
  };
  const handleCreditCardClick = () => {
    navigate('/student/credit-bank');
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

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleProfileCardClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Your Profile
              </CardTitle>
              <UserCircle className="h-5 w-5 text-[#0b2e63]" />
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

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleCreditCardClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Credit
              </CardTitle>
              <CreditCard className="h-5 w-5 text-[#0b2e63]" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="text-gray-600">View your credit history and balance</p>
                <div className="mt-3 space-y-1">
                  <p className="text-xs">
                    • Current Balance:{' '}
                    {isLoading ? 'Loading...' : typeof totalCredits === 'number' ? `${totalCredits} Credits` : 'N/A'}
                  </p>
                  {error && (
                    <p className="text-xs text-red-600" title={error}>• Failed to load credits</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};