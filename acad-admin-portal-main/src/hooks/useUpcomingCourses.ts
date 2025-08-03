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
  description?: string;
  level?: string;
  courseType?: string;
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
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/courses?completionStatus=upcoming', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUpcomingCourses(data.data || []);
        setUpcomingCoursesCount(data.count || 0);
      } else {
        setError(data.error || 'Failed to fetch upcoming courses');
      }
    } catch (err) {
      console.error('Error fetching upcoming courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming courses');
      // Set default values when there's an error
      setUpcomingCourses([]);
      setUpcomingCoursesCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    upcomingCourses,
    upcomingCoursesCount,
    loading,
    error,
    fetchUpcomingCourses,
    refetch: fetchUpcomingCourses
  };
}; 