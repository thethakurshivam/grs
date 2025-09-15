import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Briefcase, GraduationCap, Phone, Mail, MapPin, Building, Award } from 'lucide-react';
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
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">BPR&D Trainee Profile</h1>
          <p className="text-lg text-gray-600">Loading your profile information...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">BPR&D Trainee Profile</h1>
          <p className="text-lg text-gray-600">Error loading profile information</p>
        </div>
        <Card className="border border-gray-200 bg-white rounded-xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
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
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">BPR&D Trainee Profile</h1>
          <p className="text-lg text-gray-600">No profile data available</p>
        </div>
        
        {/* Debug Information */}
        <Card className="border border-gray-200 bg-gray-50 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Debug Information</CardTitle>
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
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
          <User className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">BPR&D Trainee Profile</h1>
        <p className="text-lg text-gray-600">Your complete profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-gray-900 text-lg font-semibold">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <User className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Name</p>
                  <p className="font-semibold text-gray-900">{student.Name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Mail className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
                  <p className="font-semibold text-gray-900">{student.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Building className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Employee ID</p>
                  <p className="font-semibold text-gray-900">{student.EmployeeId || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-gray-900 text-lg font-semibold">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Briefcase className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Designation</p>
                  <p className="font-semibold text-gray-900">{student.Designation || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <MapPin className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">State</p>
                  <p className="font-semibold text-gray-900">{student.State || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Building className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Department</p>
                  <p className="font-semibold text-gray-900">{student.Department || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Information */}
        <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-gray-900 text-lg font-semibold">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              Training Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Award className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Umbrella</p>
                  <p className="font-semibold text-gray-900">{student.Umbrella || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <GraduationCap className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Credits</p>
                  <p className="font-semibold text-gray-900">{student.Total_Credits || 0} Credits</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow rounded-xl shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-gray-900 text-lg font-semibold">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Phone className="h-5 w-5 text-white" />
              </div>
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Phone className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone</p>
                  <p className="font-semibold text-gray-900">{student.Phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
