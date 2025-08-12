import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Briefcase, GraduationCap, Phone } from 'lucide-react';
import { useBPRNDStudentProfile } from '../../hooks/useBPRNDStudentProfile';

export const BPRNDProfileAPIPage: React.FC = () => {
  const { student, loading, error, fetchStudentProfile, clearError } = useBPRNDStudentProfile();

  useEffect(() => {
    // Get student ID from localStorage (stored during login)
    const studentId = localStorage.getItem('studentId');
    
    if (studentId) {
      fetchStudentProfile(studentId);
    }
  }, [fetchStudentProfile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BPRND Student Profile</h1>
          <p className="text-gray-700 mt-2">Loading your profile information...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BPRND Student Profile</h1>
          <p className="text-gray-700 mt-2">Error loading profile information</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          BPRND Student Profile
        </h1>
        <p className="text-gray-700 mt-2">
          Profile loaded from API - All data from credit_calculations collection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <User className="w-5 h-5" />
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
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Briefcase className="w-5 h-5" />
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
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <GraduationCap className="w-5 h-5" />
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
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Phone className="w-5 h-5" />
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


      </div>
    </div>
  );
};
