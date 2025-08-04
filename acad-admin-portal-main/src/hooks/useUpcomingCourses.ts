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
  field: string | { _id: string; name: string; count: number };
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

interface UpcomingCoursesResponse {
  success: boolean;
  count: number;
  data: Course[];
}

export const useUpcomingCourses = () => {
  const [upcomingCourses, setUpcomingCourses] = useState<Course[]>([]);
  const [upcomingCoursesCount, setUpcomingCoursesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('Token found:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Making API request to:', 'http://localhost:3000/api/courses/upcoming');
      
      const response = await fetch('http://localhost:3000/api/courses/upcoming', {
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

      const data: UpcomingCoursesResponse = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setUpcomingCourses(data.data);
        setUpcomingCoursesCount(data.count);
        console.log('Successfully fetched', data.count, 'upcoming courses');
      } else {
        throw new Error(data.error || 'Failed to fetch upcoming courses');
      }
    } catch (err) {
      console.error('Error in fetchUpcomingCourses:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUpcomingCourses([]);
      setUpcomingCoursesCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingCourses();
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