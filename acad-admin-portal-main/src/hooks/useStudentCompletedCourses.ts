import { useState, useCallback } from 'react';

interface CompletedCourse {
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

interface UseStudentCompletedCoursesReturn {
  completedCourses: CompletedCourse[];
  loading: boolean;
  error: string | null;
  completedCourseCount: number;
  fetchCompletedCourses: (studentId: string) => Promise<void>;
}

export const useStudentCompletedCourses = (): UseStudentCompletedCoursesReturn => {
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompletedCourses = useCallback(async (studentId: string) => {
    if (!studentId) {
      setError('Student ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('studentToken');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/students/${studentId}/completed-courses`, {
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
      setCompletedCourses(data);
    } catch (err) {
      console.error('Error fetching completed courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch completed courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const completedCourseCount = completedCourses.length;

  return {
    completedCourses,
    loading,
    error,
    completedCourseCount,
    fetchCompletedCourses
  };
}; 