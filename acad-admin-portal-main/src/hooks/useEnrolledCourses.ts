import { useState, useRef, useCallback } from 'react';

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

  // Guards to prevent refetch loops/concurrent calls
  const isFetchingRef = useRef<boolean>(false);
  const lastStudentIdRef = useRef<string | null>(null);

  const fetchEnrolledCourses = useCallback(async (studentId: string) => {
    if (!studentId) {
      setError('Student ID is required');
      return;
    }

    // Skip if we're already fetching, or if we already fetched for this studentId
    if (isFetchingRef.current) return;
    if (lastStudentIdRef.current === studentId && enrolledCourses.length > 0) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    const maxRetries = 2;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
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

        const data: Course[] = await response.json();
        setEnrolledCourses(Array.isArray(data) ? data : []);
        setEnrolledCourseCount(Array.isArray(data) ? data.length : 0);
        lastStudentIdRef.current = studentId;
        break; // success
      } catch (err) {
        retryCount += 1;
        if (retryCount > maxRetries) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enrolled courses';
          setError(errorMessage);
        } else {
          await new Promise((r) => setTimeout(r, 600 * retryCount));
        }
      } finally {
        // Only clear fetching once we exit loop or on failure after retries
        if (retryCount > maxRetries || lastStudentIdRef.current === studentId) {
          isFetchingRef.current = false;
          setLoading(false);
        }
      }
    }
  }, [enrolledCourses.length]);

  return {
    enrolledCourses,
    loading,
    error,
    enrolledCourseCount,
    fetchEnrolledCourses,
  };
};
