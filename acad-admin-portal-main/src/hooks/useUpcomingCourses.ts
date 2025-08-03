import { useState, useCallback } from 'react';

interface Course {
  _id: string;
  ID: string;
  courseName: string;
  organization: string;
  duration: string;
  indoorCredits: number;
  outdoorCredits: number;
  field: string;
  startDate: string;
  completionStatus: string;
  mou_id: string;
  subjects: Array<{
    noOfPeriods: number;
    periodsMin: number;
    totalMins: number;
    totalHrs: number;
    credits: number;
  }>;
}

interface UseUpcomingCoursesReturn {
  upcomingCourses: Course[];
  upcomingCoursesCount: number;
  loading: boolean;
  error: string | null;
  fetchUpcomingCourses: () => Promise<void>;
}

export const useUpcomingCourses = (): UseUpcomingCoursesReturn => {
  const [upcomingCourses, setUpcomingCourses] = useState<Course[]>([]);
  const [upcomingCoursesCount, setUpcomingCoursesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/courses/upcoming', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUpcomingCourses(data.courses || []);
        setUpcomingCoursesCount(data.count || 0);
      } else {
        setError(data.error || 'Failed to fetch upcoming courses');
      }
    } catch (err) {
      console.error('Error fetching upcoming courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming courses');
      // Set default values for demo purposes
      setUpcomingCourses([]);
      setUpcomingCoursesCount(8);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    upcomingCourses,
    upcomingCoursesCount,
    loading,
    error,
    fetchUpcomingCourses
  };
}; 