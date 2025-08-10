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
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData';


import { useNavigate } from 'react-router-dom';

export const StudentDashboardOverview: React.FC = () => {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState<string>('');
  
  const {
    courses,
    availableCredits,
    usedCredits,
    completedCourses,
    enrolledCourses,
    loading,
    error,
    courseCount,
    completedCourseCount,
    enrolledCourseCount,
    refreshData
  } = useStudentDashboardData(studentId);

  // Debug logging
  console.log('Dashboard data:', {
    courseCount,
    completedCourseCount,
    enrolledCourseCount,
    loading,
    error,
    studentId
  });

  // Log card values for debugging
  console.log('Card values:', {
    availableCourses: loading ? 'Loading...' : `${courseCount} courses`,
    completedCourses: loading ? 'Loading...' : `${completedCourseCount} courses`,
    enrolledCourses: loading ? 'Loading...' : `${enrolledCourseCount} courses`
  });

  // Get student ID from localStorage or other source
  useEffect(() => {
    const storedStudentId = localStorage.getItem('studentId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, []);



  const handleCoursesCardClick = () => {
    navigate('/student/available-courses');
  };

  const handleCompletedCoursesCardClick = () => {
    navigate('/student/completed-courses');
  };

  const handleEnrolledCoursesCardClick = () => {
    navigate(`/student/${studentId}/enrolled-courses`);
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
      value: loading ? 'Loading...' : `${courseCount} courses`,
      description: 'Available courses for enrollment',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      onClick: handleCoursesCardClick,
      clickable: true
    },
    {
      title: 'Enrolled Courses',
      value: loading ? 'Loading...' : `${enrolledCourseCount} courses`,
      description: 'Courses you are currently enrolled in',
      icon: BookOpen,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      onClick: handleEnrolledCoursesCardClick,
      clickable: true
    },
    {
      title: 'Completed Courses',
      value: loading ? 'Loading...' : `${completedCourseCount} courses`,
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
      value: loading ? '...' : availableCredits.toString(),
      description: 'Credits available for use',
      icon: Coins,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Used Credit',
      value: loading ? '...' : usedCredits.toString(),
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-700 mt-2">Welcome back! Here's an overview of your academic progress.</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-900 font-semibold mb-2">Error occurred while loading data:</h3>
          <p className="text-red-700 text-sm">{error}</p>
          <button 
            onClick={refreshData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
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