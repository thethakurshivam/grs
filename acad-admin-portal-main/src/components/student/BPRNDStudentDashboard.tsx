import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserCircle, CreditCard, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentDashboardLayout } from './StudentDashboardLayout';
import useBPRNDStudentCredits from '@/hooks/useBPRNDStudentCredits';
import { useBPRNDStudentCertificates } from '@/hooks/useBPRNDStudentCertificates';
import useBPRNDStudentPendingCredits from '@/hooks/useBPRNDStudentPendingCredits';

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
  const { totalCredits, isLoading, error, refetch } = useBPRNDStudentCredits(studentId);
  const { certificates: studentCertificates, loading: certificatesLoading, fetchCertificates } = useBPRNDStudentCertificates();
  const { data: pendingCredits, isLoading: pendingCreditsLoading, error: pendingCreditsError, refetch: refetchPendingCredits } = useBPRNDStudentPendingCredits(studentId);

  useEffect(() => {
    const onFocus = () => {
      refetch();
      refetchPendingCredits();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch, refetchPendingCredits]);

  // Fetch certificates when component mounts
  useEffect(() => {
    if (studentId) {
      fetchCertificates(studentId);
    }
  }, [studentId, fetchCertificates]);

  const handleProfileCardClick = () => {
    if (studentId) {
      console.log('Navigating to profile with student ID:', studentId);
      navigate(`/student/bprnd/profile-api`);
    } else {
      console.error('No student ID available for profile navigation');
      console.log('Available localStorage keys:', Object.keys(localStorage));
      console.log('bprndStudentData:', localStorage.getItem('bprndStudentData'));
      console.log('bprndStudentId:', localStorage.getItem('bprndStudentId'));
      console.log('studentId:', localStorage.getItem('studentId'));
    }
  };
  const handleCreditCardClick = () => {
    navigate('/student/bprnd/credit-bank');
  };

  const handleCertificatesCardClick = () => {
    navigate('/student/bprnd/certificates');
  };

  const handlePendingCreditsCardClick = () => {
    navigate('/student/bprnd/pending-credits');
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-sm mb-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">BPR&D Candidate Portal</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Access your profile, credits, certifications, and track your professional development journey.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer rounded-xl overflow-hidden group"
            onClick={handleProfileCardClick}
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                Your Profile
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCircle className="h-5 w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                  <p className="font-semibold text-gray-800 text-base">{studentName}</p>
                  <p className="text-sm text-gray-600">{studentDesignation} | {studentState} Police</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Training Hours: <span className="font-semibold">120 hrs</span></span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Credits Earned: <span className="font-semibold">45</span></span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Umbrella: <span className="font-semibold">{studentUmbrella}</span></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer rounded-xl overflow-hidden group"
            onClick={handleCreditCardClick}
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                Credit Bank
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="h-5 w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="p-3 bg-green-50/50 rounded-lg border border-green-100/50">
                  <p className="text-sm text-gray-600">View your credit history and balance</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Current Balance: <span className="font-semibold text-green-700">{isLoading ? 'Loading...' : typeof totalCredits === 'number' ? `${totalCredits} Credits` : 'N/A'}</span></span>
                  </div>
                  {error && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Failed to load credits</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer rounded-xl overflow-hidden group"
            onClick={handleCertificatesCardClick}
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                Your Certificates
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="h-5 w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100/50">
                  <p className="text-sm text-gray-600">View your earned certifications</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Total Certificates: <span className="font-semibold text-amber-700">{certificatesLoading ? 'Loading...' : studentCertificates?.length || 0}</span></span>
                  </div>
                  {studentCertificates && studentCertificates.length > 0 && (
                    <>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Latest: <span className="font-semibold">{studentCertificates[0]?.umbrellaKey?.replace(/_/g, ' ') || 'N/A'}</span></span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Issued: <span className="font-semibold">{new Date(studentCertificates[0]?.issuedAt).getFullYear()}</span></span>
                      </div>
                    </>
                  )}
                  {(!studentCertificates || studentCertificates.length === 0) && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>No certificates yet</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer rounded-xl overflow-hidden group"
            onClick={handlePendingCreditsCardClick}
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                Pending Credit Requests
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100/50">
                  <p className="text-sm text-gray-600">Track your credit request status</p>
                </div>
                <div className="space-y-2">
                  {pendingCreditsLoading ? (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Loading...</span>
                    </div>
                  ) : pendingCreditsError ? (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Error loading data</span>
                    </div>
                  ) : pendingCredits && pendingCredits.length > 0 ? (
                    <>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Total Requests: <span className="font-semibold text-purple-700">{pendingCredits.length}</span></span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Latest: <span className="font-semibold">{pendingCredits[0]?.discipline || 'N/A'}</span></span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Status: <span className="font-semibold">{pendingCredits[0]?.status || 'pending'}</span></span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>No pending requests</span>
                    </div>
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