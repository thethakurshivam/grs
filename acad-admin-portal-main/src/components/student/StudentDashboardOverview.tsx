import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  User, 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  Coins, 
  Award,
  UserCircle
} from 'lucide-react';
import { useStudentCourses } from '../../hooks/useStudentCourses';
import { useStudentAvailableCredits } from '../../hooks/useStudentAvailableCredits';
import { useStudentUsedCredits } from '../../hooks/useStudentUsedCredits';
import { useStudentCompletedCourses } from '../../hooks/useStudentCompletedCourses';

import { useNavigate } from 'react-router-dom';

export const StudentDashboardOverview: React.FC = () => {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState<string>('');
  
  const { courses, loading: coursesLoading, error: coursesError, courseCount, fetchCourses } = useStudentCourses();
  const { availableCredits, loading: availableCreditsLoading, error: availableCreditsError, fetchAvailableCredits } = useStudentAvailableCredits();
  const { usedCredits, loading: usedCreditsLoading, error: usedCreditsError, fetchUsedCredits } = useStudentUsedCredits();
  const { completedCourses, loading: completedCoursesLoading, error: completedCoursesError, completedCourseCount, fetchCompletedCourses } = useStudentCompletedCourses();

  // Get student ID from localStorage or other source
  useEffect(() => {
    // For now, we'll use a placeholder. In a real app, you'd get this from the student's profile
    const storedStudentId = localStorage.getItem('studentId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, []);

  // Fetch data when student ID is available
  useEffect(() => {
    if (studentId) {
      fetchCourses(studentId);
      fetchAvailableCredits(studentId);
      fetchUsedCredits(studentId);
      fetchCompletedCourses(studentId);
    }
  }, [studentId, fetchCourses, fetchAvailableCredits, fetchUsedCredits, fetchCompletedCourses]);

  const handleCoursesCardClick = () => {
    navigate('/student/available-courses');
  };

  const handleCompletedCoursesCardClick = () => {
    navigate('/student/completed-courses');
  };

  const handleProfileCardClick = () => {
    navigate('/student/profile');
  };

  const cards: Array<{
    title: string;
    value: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    onClick?: () => void;
    clickable?: boolean;
  }> = [
    {
      title: 'Profile',
      value: 'View',
      description: 'Manage your student profile',
      icon: UserCircle,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      onClick: handleProfileCardClick,
      clickable: true
    },
    {
      title: 'Basic Info & Available Courses',
      value: coursesLoading ? '...' : courseCount.toString(),
      description: 'Available courses for enrollment',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      onClick: handleCoursesCardClick,
      clickable: true
    },
    {
      title: 'Completed Courses',
      value: completedCoursesLoading ? '...' : completedCourseCount.toString(),
      description: 'Successfully completed courses',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      onClick: handleCompletedCoursesCardClick,
      clickable: true
    },
    {
      title: 'Credit Bank',
      value: '45',
      description: 'Total credits earned',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Available Credit',
      value: availableCreditsLoading ? '...' : availableCredits.toString(),
      description: 'Credits available for use',
      icon: Coins,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Used Credit',
      value: usedCreditsLoading ? '...' : usedCredits.toString(),
      description: 'Credits already utilized',
      icon: Award,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Completed Courses Other Than RRU',
      value: '5',
      description: 'External course completions',
      icon: User,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  // Show error messages if any
  const hasErrors = coursesError || availableCreditsError || usedCreditsError || completedCoursesError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-700 mt-2">Welcome back! Here's an overview of your academic progress.</p>
      </div>

      {/* Error Display */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-900 font-semibold mb-2">Errors occurred while loading data:</h3>
          {coursesError && <p className="text-red-700 text-sm">Courses: {coursesError}</p>}
          {availableCreditsError && <p className="text-red-700 text-sm">Available Credits: {availableCreditsError}</p>}
          {usedCreditsError && <p className="text-red-700 text-sm">Used Credits: {usedCreditsError}</p>}
          {completedCoursesError && <p className="text-red-700 text-sm">Completed Courses: {completedCoursesError}</p>}
        </div>
      )}



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index} 
              className={`hover:shadow-lg transition-shadow ${card.clickable ? 'cursor-pointer' : ''}`}
              onClick={card.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium text-gray-700">
                {card.title}
              </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="text-xs text-gray-600 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}; 