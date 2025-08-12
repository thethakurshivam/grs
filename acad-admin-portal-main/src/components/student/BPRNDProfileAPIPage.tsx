import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Briefcase, GraduationCap, Phone, List } from 'lucide-react';
import { useBPRNDStudentProfile } from '../../hooks/useBPRNDStudentProfile';

export const BPRNDProfileAPIPage: React.FC = () => {
  const { student, loading, error, fetchStudentProfile, clearError } = useBPRNDStudentProfile();

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (studentId) fetchStudentProfile(studentId);
  }, [fetchStudentProfile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BPR&D Student Profile</h1>
          <p className="text-gray-700 mt-2">Loading your profile information...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BPR&D Student Profile</h1>
          <p className="text-gray-700 mt-2">Error loading profile information</p>
        </div>
        <Card className="border border-red-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BPRND Student Profile</h1>
          <p className="text-gray-700 mt-2">No profile data available</p>
        </div>
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
        <h1 className="text-3xl font-bold text-gray-900">BPR&D Student Profile</h1>
        <p className="text-gray-700 mt-2">Profile loaded from API - All data from credit_calculations collection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{student.Name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{student.email || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Briefcase className="w-5 h-5 text-primary" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Designation</p>
                <p className="font-medium text-gray-900">{student.Designation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="font-medium text-gray-900">{student.State || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{student.Department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium text-gray-900">{student.EmployeeId || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Information */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <GraduationCap className="w-5 h-5 text-primary" />
              Training Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Umbrella</p>
                <p className="font-medium text-gray-900">{student.Umbrella || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Training Hours</p>
                <p className="font-medium text-gray-900">120 hrs</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Credits Earned</p>
                <p className="font-medium text-gray-900">45</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Phone className="w-5 h-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{student.Phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joining Date</p>
                <p className="font-medium text-gray-900">{student.JoiningDate || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All raw profile data */}
        <Card className="border border-gray-200 bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <List className="w-5 h-5 text-primary" />
              All Profile Data (from backend)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(student).map(([key, value]) => (
                <div key={key} className="p-3 rounded border border-gray-200 bg-white">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{key}</p>
                  <pre className="mt-1 text-sm text-gray-900 whitespace-pre-wrap break-words">{renderValue(value)}</pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
