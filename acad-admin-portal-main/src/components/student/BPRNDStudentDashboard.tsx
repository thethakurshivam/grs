import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserCircle, CreditCard, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentDashboardLayout } from './StudentDashboardLayout';
import useBPRNDStudentCredits from '@/hooks/useBPRNDStudentCredits';
import { useBPRNDStudentCertificates } from '@/hooks/useBPRNDStudentCertificates';

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

  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

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

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Student Portal</h1>
          <p className="text-lg text-black mt-2">Access your profile, credits and certifications.</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="bg-white border border-[#0b2e63]/20 hover:border-[#0b2e63]/40 hover:shadow-xl transition-shadow cursor-pointer rounded-xl"
            onClick={handleProfileCardClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-black">
                Your Profile
              </CardTitle>
              <div className="h-9 w-9 rounded-full bg-[#0b2e63]/10 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-[#0b2e63]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg text-black">
                <p className="font-semibold">{studentName}</p>
                <p className="opacity-80">{studentDesignation} | {studentState} Police</p>
                <div className="mt-3 space-y-1">
                  <p className="text-base">• Training Hours: 120 hrs</p>
                  <p className="text-base">• Credits Earned: 45</p>
                  <p className="text-base">• Umbrella: {studentUmbrella}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border border-[#0b2e63]/20 hover:border-[#0b2e63]/40 hover:shadow-xl transition-shadow cursor-pointer rounded-xl"
            onClick={handleCreditCardClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-black">
                Credit
              </CardTitle>
              <div className="h-9 w-9 rounded-full bg-[#0b2e63]/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-[#0b2e63]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg text-black">
                <p className="opacity-80">View your credit history and balance</p>
                <div className="mt-3 space-y-1">
                  <p className="text-base">• Current Balance {isLoading ? 'Loading...' : typeof totalCredits === 'number' ? `${totalCredits} Credits` : 'N/A'}</p>
                  {error && (
                    <p className="text-sm text-red-600" title={error}>• Failed to load credits</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border border-[#0b2e63]/20 hover:border-[#0b2e63]/40 hover:shadow-xl transition-shadow cursor-pointer rounded-xl"
            onClick={handleCertificatesCardClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-black">
                Your Certificates
              </CardTitle>
              <div className="h-9 w-9 rounded-full bg-[#0b2e63]/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-[#0b2e63]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg text-black">
                <p className="opacity-80">View your earned certifications</p>
                <div className="mt-3 space-y-1">
                  <p className="text-base">• Total Certificates: {certificatesLoading ? 'Loading...' : studentCertificates?.length || 0}</p>
                  {studentCertificates && studentCertificates.length > 0 && (
                    <>
                      <p className="text-base">• Latest: {studentCertificates[0]?.umbrellaKey?.replace(/_/g, ' ') || 'N/A'}</p>
                      <p className="text-base">• Issued: {new Date(studentCertificates[0]?.issuedAt).getFullYear()}</p>
                    </>
                  )}
                  {(!studentCertificates || studentCertificates.length === 0) && (
                    <p className="text-base">• No certificates yet</p>
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