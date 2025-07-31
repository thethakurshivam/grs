import { useState, useEffect } from 'react';

interface Course {
  _id: string;
  ID: string;
  mou_id: string;
  courseName: string;
  organization: string;
  duration: string;
  indoorCredits: number;
  outdoorCredits: number;
  field: string;
  startDate: string;
  completionStatus: string;
  subjects: Array<{
    noOfPeriods: number;
    periodsMin: number;
    totalMins: number;
    totalHrs: number;
    credits: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CompletedCoursesResponse {
  success: boolean;
  count: number;
  data: Course[];
  filters: {
    completionStatus: string;
    field: string | null;
    organization: string | null;
    startDateFrom: string | null;
    startDateTo: string | null;
    mou_id: string | null;
  };
}

export const useCompletedCoursesCount = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompletedCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('Token found:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Making API request to:', 'http://localhost:3000/api/courses?completionStatus=completed');
      
      const response = await fetch('http://localhost:3000/api/courses?completionStatus=completed', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: CompletedCoursesResponse = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setCourses(data.data);
        setCount(data.count);
        console.log('Successfully fetched', data.count, 'completed courses');
      } else {
        throw new Error(data.error || 'Failed to fetch completed courses');
      }
    } catch (err) {
      console.error('Error in fetchCompletedCourses:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCourses([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedCourses();
  }, []);

  return {
    courses,
    count,
    loading,
    error,
    refetch: fetchCompletedCourses
  };
}; 