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

interface OngoingCoursesResponse {
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

export const useOngoingCoursesCount = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOngoingCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('Token found:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Making API request to:', 'http://localhost:3000/api/courses/ongoing');
      
      const response = await fetch('http://localhost:3002/api/courses/ongoing', {
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

      const data: OngoingCoursesResponse = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setCourses(data.data);
        setCount(data.count);
        console.log('Successfully fetched', data.count, 'ongoing courses');
      } else {
        throw new Error(data.error || 'Failed to fetch ongoing courses');
      }
    } catch (err) {
      console.error('Error in fetchOngoingCourses:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCourses([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoingCourses();
  }, []);

  return {
    courses,
    count,
    loading,
    error,
    refetch: fetchOngoingCourses
  };
}; 