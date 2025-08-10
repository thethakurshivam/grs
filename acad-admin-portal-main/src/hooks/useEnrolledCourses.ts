import { useState, useEffect } from 'react';

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
  endDate: string;
  completionStatus: string;
  description: string;
  mou_id: string;
}

interface UseEnrolledCoursesReturn {
  enrolledCourses: Course[];
  loading: boolean;
  error: string | null;
  enrolledCourseCount: number;
  fetchEnrolledCourses: (studentId: string) => Promise<void>;
}

export const useEnrolledCourses = (): UseEnrolledCoursesReturn => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourseCount, setEnrolledCourseCount] = useState(0);

  const fetchEnrolledCourses = async (studentId: string) => {
    if (!studentId) {
      setError('Student ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const token = localStorage.getItem('studentToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(`http://localhost:3001/students/${studentId}/enrolled-courses`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEnrolledCourses(data);
        setEnrolledCourseCount(data.length);
        break; // Success, exit retry loop
      } catch (err) {
        retryCount++;
        console.error(`Error fetching enrolled courses (attempt ${retryCount}):`, err);
        
        if (retryCount >= maxRetries) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enrolled courses';
          setError(errorMessage);
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }
    
    setLoading(false);
  };

  return {
    enrolledCourses,
    loading,
    error,
    enrolledCourseCount,
    fetchEnrolledCourses,
  };
};
