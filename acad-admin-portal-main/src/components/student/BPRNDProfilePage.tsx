import React from 'react';
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
} from 'lucide-react';

export const BPRNDProfilePage: React.FC = () => {
  // Get data from localStorage or use dummy data - NO API CALLS
  const studentName = localStorage.getItem('studentName') || 'Officer John Doe';
  const studentEmail =
    localStorage.getItem('studentEmail') || 'john.doe@police.gov.in';
  const studentDesignation =
    localStorage.getItem('studentDesignation') || 'Police Officer';
  const studentState = localStorage.getItem('studentState') || 'Maharashtra';
  const studentUmbrella =
    localStorage.getItem('studentUmbrella') || 'Cyber Security';
  const studentDepartment =
    localStorage.getItem('studentDepartment') ||
    'Criminal Investigation Department';
  const studentEmployeeId =
    localStorage.getItem('studentEmployeeId') || 'MH001234';
  const studentPhone = localStorage.getItem('studentPhone') || '+91 9876543210';
  const studentJoiningDate =
    localStorage.getItem('studentJoiningDate') || '2023-01-15';

  // Profile data with localStorage + dummy fallbacks
  const profileData = {
    name: studentName,
    email: studentEmail,
    phone: studentPhone,
    designation: studentDesignation,
    state: studentState,
    umbrella: studentUmbrella,
    joiningDate: studentJoiningDate,
    employeeId: studentEmployeeId,
    department: studentDepartment,
    trainingHours: 120, // Dummy - could be from localStorage later
    creditsEarned: 45, // Dummy - could be from localStorage later
    completedCourses: 8, // Dummy - could be from localStorage later
    ongoingCourses: 2, // Dummy - could be from localStorage later
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          BPRND Student Profile
        </h1>
        <p className="text-gray-700 mt-2">
          Your complete profile and training information
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
                <p className="font-medium">{profileData.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profileData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{profileData.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="font-medium">{profileData.state}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium">{profileData.employeeId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Designation</p>
                <p className="font-medium">{profileData.designation}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{profileData.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Joining Date</p>
                <p className="font-medium">{profileData.joiningDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Training Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Umbrella Category</p>
                <Badge variant="secondary">{profileData.umbrella}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Training Hours</p>
                <p className="font-medium">{profileData.trainingHours} hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Credits Earned</p>
                <p className="font-medium">
                  {profileData.creditsEarned} credits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Course Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Completed Courses</span>
              <Badge variant="default">{profileData.completedCourses}</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Ongoing Courses</span>
              <Badge variant="secondary">{profileData.ongoingCourses}</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Courses</span>
              <Badge variant="outline">
                {profileData.completedCourses + profileData.ongoingCourses}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
