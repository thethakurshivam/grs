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
          BPR&D Candidate Profile
        </h1>
        <p className="text-gray-700 mt-2">
          Your complete profile and training information
        </p>
      </div>

      <Card className="border-teal-200 bg-teal-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-teal-700">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1">
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm col-span-2">{studentName}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm col-span-2">{studentEmail}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-sm font-medium">Designation:</span>
              <span className="text-sm col-span-2">{studentDesignation}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-sm font-medium">State:</span>
              <span className="text-sm col-span-2">{studentState}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-sm font-medium">Department:</span>
              <span className="text-sm col-span-2">{studentDepartment}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
