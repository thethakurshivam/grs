import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Briefcase, GraduationCap, Phone, List } from 'lucide-react';
import { useBPRNDStudentProfile } from '../../hooks/useBPRNDStudentProfile';

export const BPRNDProfileAPIPage: React.FC = () => {
  const { student, loading, error, fetchStudentProfile, clearError } = useBPRNDStudentProfile();

  useEffect(() => {
    // Use the same logic as the dashboard to get student ID
    const getStudentId = () => {
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
      return studentId;
    };

    // Try to get student ID immediately
    let studentId = getStudentId();
    
    if (studentId) {
      console.log('Fetching profile for student ID:', studentId);
      fetchStudentProfile(studentId);
    } else {
      console.log('No student ID found immediately, waiting and retrying...');
      // If not found immediately, wait a bit and retry (in case localStorage is still being set)
      const timer = setTimeout(() => {
        studentId = getStudentId();
        if (studentId) {
          console.log('Retry successful, fetching profile for student ID:', studentId);
          fetchStudentProfile(studentId);
        } else {
          console.error('Still no student ID found after retry');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [fetchStudentProfile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Student Profile</h1>
          <p className="text-lg text-black mt-2">Loading your profile information...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b2e63]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Student Profile</h1>
          <p className="text-lg text-black mt-2">Error loading profile information</p>
        </div>
        <Card className="border border-red-200 bg-white rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="mt-4 px-4 py-2 bg-[#0b2e63] text-white rounded-lg hover:bg-[#0b2e63]/90 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    // Debug: show what student ID we're looking for
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
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Student Profile</h1>
          <p className="text-lg text-black mt-2">No profile data available</p>
        </div>
        
        {/* Debug Information */}
        <Card className="border border-yellow-200 bg-yellow-50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-yellow-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Student ID found:</strong> {studentId || 'None'}</p>
              <p><strong>bprndStudentData:</strong> {storedBprnd ? 'Present' : 'Not found'}</p>
              <p><strong>bprndStudentId:</strong> {localStorage.getItem('bprndStudentId') || 'Not found'}</p>
              <p><strong>studentId:</strong> {localStorage.getItem('studentId') || 'Not found'}</p>
              <p><strong>All localStorage keys:</strong> {Object.keys(localStorage).join(', ')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderValue = (val: any) => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
    try { return JSON.stringify(val, null, 2); } catch { return String(val); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Student Profile</h1>
        <p className="text-lg text-black mt-2">Your complete profile information and credit breakdown</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border border-[#0b2e63]/20 bg-white hover:shadow-lg transition-shadow rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0b2e63] text-base font-semibold">
              <User className="w-4 h-4 text-[#0b2e63]" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Name</p>
                <p className="font-medium text-gray-900 text-sm">{student.Name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
                <p className="font-medium text-gray-900 text-sm">{student.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Employee ID</p>
                <p className="font-medium text-gray-900 text-sm">{student.EmployeeId || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="border border-[#0b2e63]/20 bg-white hover:shadow-lg transition-shadow rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0b2e63] text-base font-semibold">
              <Briefcase className="w-4 h-4 text-[#0b2e63]" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Designation</p>
                <p className="font-medium text-gray-900 text-sm">{student.Designation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">State</p>
                <p className="font-medium text-gray-900 text-sm">{student.State || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Department</p>
                <p className="font-medium text-gray-900 text-sm">{student.Department || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Information */}
        <Card className="border border-[#0b2e63]/20 bg-white hover:shadow-lg transition-shadow rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0b2e63] text-base font-semibold">
              <GraduationCap className="w-4 h-4 text-[#0b2e63]" />
              Training Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Umbrella</p>
                <p className="font-medium text-gray-900 text-sm">{student.Umbrella || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Credits</p>
                <p className="font-medium text-gray-900 text-sm">{student.Total_Credits || 0} Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border border-[#0b2e63]/20 bg-white hover:shadow-lg transition-shadow rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0b2e63] text-base font-semibold">
              <Phone className="w-4 h-4 text-[#0b2e63]" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone</p>
                <p className="font-medium text-gray-900 text-sm">{student.Phone || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Breakdown */}
        <Card className="border border-[#0b2e63]/20 bg-white hover:shadow-lg transition-shadow rounded-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0b2e63] text-base font-semibold">
              <List className="w-4 h-4 text-[#0b2e63]" />
              Credit Breakdown by Umbrella
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(student).map(([key, value]) => {
                // Only show umbrella credit fields
                if (key.includes('_') && key !== 'Total_Credits' && key !== 'createdAt' && key !== 'updatedAt' && key !== '_id') {
                  return (
                    <div key={key} className="p-3 rounded-lg border border-[#0b2e63]/20 bg-[#0b2e63]/5 hover:bg-[#0b2e63]/10 transition-colors">
                      <p className="text-xs font-medium text-[#0b2e63] uppercase tracking-wide">{key.replace(/_/g, ' ')}</p>
                      <p className="mt-1 text-lg font-semibold text-black">{value || 0} Credits</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
