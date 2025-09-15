import React, { useEffect } from 'react';
import { useBPRNDStudentProfile } from '../hooks/useBPRNDStudentProfile';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { User, Mail, MapPin, Award } from 'lucide-react';

// Example component showing how to use the BPRND student profile API
const BPRNDProfileWithAPI: React.FC = () => {
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
        <h1 className="text-3xl font-bold text-gray-900">BPRND Student Profile</h1>
        <p className="text-gray-700 mt-2">
          Profile loaded from API - All data from credit_calculations collection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{student.Name || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{student.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="font-medium">{student.State || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Designation</p>
                <p className="font-medium">{student.Designation || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Umbrella Category</p>
                <Badge variant="secondary">{student.Umbrella || 'N/A'}</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium">{student.EmployeeId || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Data from API */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Complete Data from credit_calculations Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(student, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BPRNDProfileWithAPI;
