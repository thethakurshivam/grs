import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  User, 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  Coins, 
  Award 
} from 'lucide-react';
import { useStudentCourses } from '../../hooks/useStudentCourses';
import { useStudentAvailableCredits } from '../../hooks/useStudentAvailableCredits';
import { useStudentUsedCredits } from '../../hooks/useStudentUsedCredits';
import { CoursesListModal } from './CoursesListModal';

export const StudentDashboardOverview: React.FC = () => {
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [studentId, setStudentId] = useState<string>('');
  
  const { courses, loading: coursesLoading, error: coursesError, courseCount, fetchCourses } = useStudentCourses();
  const { availableCredits, loading: availableCreditsLoading, error: availableCreditsError, fetchAvailableCredits } = useStudentAvailableCredits();
  const { usedCredits, loading: usedCreditsLoading, error: usedCreditsError, fetchUsedCredits } = useStudentUsedCredits();

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
    }
  }, [studentId, fetchCourses, fetchAvailableCredits, fetchUsedCredits]);

  const handleCoursesCardClick = () => {
    if (studentId) {
      fetchCourses(studentId);
      setIsCoursesModalOpen(true);
    }
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
      value: '8',
      description: 'Successfully completed courses',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's an overview of your academic progress.</p>
      </div>

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
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Courses List Modal */}
      <CoursesListModal
        isOpen={isCoursesModalOpen}
        onClose={() => setIsCoursesModalOpen(false)}
        courses={courses}
        loading={loading}
        error={error}
      />
    </div>
  );
}; 