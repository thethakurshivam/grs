import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Award,
  BookOpen,
  GraduationCap,
  FileText,
  Building,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useBPRNDStudentProfile } from '../../hooks/useBPRNDStudentProfile';

export const BPRNDProfileAPIPage: React.FC = () => {
  const { student, loading, error, fetchStudentProfile, clearError } =
    useBPRNDStudentProfile();

  useEffect(() => {
    // Get student ID from localStorage (stored during login)
    const studentId = localStorage.getItem('studentId');

    if (studentId) {
      console.log('Fetching BPRND student profile for ID:', studentId);
      fetchStudentProfile(studentId);
    } else {
      console.error('No student ID found in localStorage');
    }
  }, [fetchStudentProfile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            BPRND Student Profile
          </h1>
          <p className="text-gray-700 mt-2">
            Loading your complete profile from database...
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">
              Fetching profile data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            BPRND Student Profile
          </h1>
          <p className="text-gray-700 mt-2">
            Error loading profile information
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Failed to load profile</span>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => {
                clearError();
                const studentId = localStorage.getItem('studentId');
                if (studentId) fetchStudentProfile(studentId);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
          <h1 className="text-3xl font-bold text-gray-900">
            BPRND Student Profile
          </h1>
          <p className="text-gray-700 mt-2">No profile data available</p>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              <span>No student data found. Please try logging in again.</span>
            </div>
          </CardContent>
        </Card>
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
          Complete profile information fetched from database
        </p>
        <Badge variant="outline" className="mt-2">
          Data Source: API /student/{student._id}
        </Badge>
      </div>

      {/* Display ALL fields from backend response */}
      <div className="space-y-6">
        {/* Summary Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <User className="w-5 h-5" />
              {student.Name || 'BPRND Student'} - Complete Profile
            </CardTitle>
            <p className="text-sm text-blue-600">
              All data fields from credit_calculations collection
            </p>
          </CardHeader>
        </Card>

        {/* Dynamic Grid - Shows ALL fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(student).map(([key, value]) => {
            // Skip internal MongoDB fields for cleaner display
            if (key.startsWith('__') || key === '_id') return null;

            // Determine card color based on field type
            let cardColor = 'border-gray-200 bg-gray-50';
            let textColor = 'text-gray-800';
            let icon = <FileText className="w-4 h-4" />;

            // Personal info fields
            if (['Name', 'email', 'Phone', 'Address'].includes(key)) {
              cardColor = 'border-blue-200 bg-blue-50';
              textColor = 'text-blue-800';
              icon = <User className="w-4 h-4" />;
            }
            // Professional info fields
            else if (
              [
                'Designation',
                'Department',
                'EmployeeId',
                'State',
                'JoiningDate',
              ].includes(key)
            ) {
              cardColor = 'border-green-200 bg-green-50';
              textColor = 'text-green-800';
              icon = <Building className="w-4 h-4" />;
            }
            // Training/Education fields
            else if (
              [
                'Umbrella',
                'TrainingHours',
                'CreditsEarned',
                'Courses',
                'Topics',
              ].includes(key)
            ) {
              cardColor = 'border-purple-200 bg-purple-50';
              textColor = 'text-purple-800';
              icon = <BookOpen className="w-4 h-4" />;
            }
            // Date fields
            else if (
              key.toLowerCase().includes('date') ||
              key.toLowerCase().includes('time')
            ) {
              cardColor = 'border-orange-200 bg-orange-50';
              textColor = 'text-orange-800';
              icon = <Calendar className="w-4 h-4" />;
            }
            // Credit/Score fields
            else if (
              key.toLowerCase().includes('credit') ||
              key.toLowerCase().includes('score') ||
              key.toLowerCase().includes('hours')
            ) {
              cardColor = 'border-yellow-200 bg-yellow-50';
              textColor = 'text-yellow-800';
              icon = <CreditCard className="w-4 h-4" />;
            }

            // Format the field name for display
            const displayKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());

            // Format the value for display
            let displayValue;
            if (value === null || value === undefined) {
              displayValue = 'N/A';
            } else if (typeof value === 'object') {
              displayValue = JSON.stringify(value, null, 2);
            } else if (typeof value === 'boolean') {
              displayValue = value ? 'Yes' : 'No';
            } else if (Array.isArray(value)) {
              displayValue = value.length > 0 ? value.join(', ') : 'Empty';
            } else {
              displayValue = String(value);
            }

            return (
              <Card key={key} className={cardColor}>
                <CardHeader className="pb-2">
                  <CardTitle
                    className={`flex items-center gap-2 text-sm ${textColor}`}
                  >
                    {icon}
                    {displayKey}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {typeof value === 'object' && value !== null ? (
                      <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                        {displayValue}
                      </pre>
                    ) : (
                      <p className="font-medium text-gray-900 break-words">
                        {displayValue}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Field: {key} | Type: {typeof value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* MongoDB Document ID */}
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <FileText className="w-5 h-5" />
              Database Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">MongoDB Document ID</p>
                <p className="font-mono text-sm bg-white p-2 rounded border">
                  {student._id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Fields</p>
                <p className="font-medium">
                  {Object.keys(student).length} fields
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Collection</p>
                <p className="font-medium">credit_calculations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
