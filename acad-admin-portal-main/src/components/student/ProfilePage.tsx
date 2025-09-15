import React, { useState, useEffect } from 'react';
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
  Building
} from 'lucide-react';
import { useStudentProfile } from '../../hooks/useStudentProfile';

export const ProfilePage: React.FC = () => {
  const [studentId, setStudentId] = useState<string>('');
  const { studentProfile, loading, error, fetchStudentProfile } = useStudentProfile();

  useEffect(() => {
    const storedStudentId = localStorage.getItem('studentId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile(studentId);
    }
  }, [studentId, fetchStudentProfile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-700 mt-2">View and manage your student information.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-700 mt-2">View and manage your student information.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-900 font-semibold mb-2">Error loading profile:</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-700 mt-2">View and manage your student information.</p>
        </div>
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Profile Data</h3>
          <p className="text-gray-600">
            Unable to load profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
        <p className="text-gray-700 mt-2">View and manage your student information.</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-teal-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Full Name:</strong>
              </p>
              <p className="text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                {studentProfile.full_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Email:</strong>
              </p>
              <p className="text-gray-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                {studentProfile.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Mobile Number:</strong>
              </p>
              <p className="text-gray-900 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                {studentProfile.mobile_no}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Alternate Number:</strong>
              </p>
              <p className="text-gray-900 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                {studentProfile.alternate_number || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Date of Birth:</strong>
              </p>
              <p className="text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                {studentProfile.dob ? new Date(studentProfile.dob).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Gender:</strong>
              </p>
              <p className="text-gray-900">{studentProfile.gender || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Enrollment Number:</strong>
              </p>
              <p className="text-gray-900">{studentProfile.enrollment_number || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Batch Number:</strong>
              </p>
              <p className="text-gray-900">{studentProfile.batch_no || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Serial Number:</strong>
              </p>
              <p className="text-gray-900">{studentProfile.serial_number || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Rank:</strong>
              </p>
              <p className="text-gray-900">{studentProfile.rank || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>MOU ID:</strong>
              </p>
              <p className="text-gray-900 flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                {studentProfile.mou_id || 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>SR Number:</strong>
              </p>
              <p className="text-gray-900">{studentProfile.sr_no || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-purple-600" />
            Credit Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{studentProfile.credits}</div>
              <div className="text-sm text-gray-600">Total Credits</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{studentProfile.available_credit}</div>
              <div className="text-sm text-gray-600">Available Credits</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{studentProfile.used_credit}</div>
              <div className="text-sm text-gray-600">Used Credits</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-green-600" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Address:</strong>
              </p>
              <p className="text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                {studentProfile.address || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Birth Place:</strong>
              </p>
              <p className="text-gray-900">{studentProfile.birth_place || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Birth State:</strong>
              </p>
              <p className="text-gray-900">{studentProfile.birth_state || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Country:</strong>
              </p>
              <p className="text-gray-900">{studentProfile.country || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Aadhar Number:</strong>
              </p>
              <p className="text-gray-900">{studentProfile.aadhar_no || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Courses Certification */}
      {studentProfile.previous_courses_certification && studentProfile.previous_courses_certification.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-600" />
              Previous Course Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentProfile.previous_courses_certification.map((cert, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{cert.course_name}</p>
                      <p className="text-sm text-gray-600">{cert.organization_name}</p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Certificate
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrolled Courses */}
      {studentProfile.course_id && studentProfile.course_id.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Enrolled Courses ({studentProfile.course_id.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {studentProfile.course_id.map((courseId, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Course {index + 1}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 