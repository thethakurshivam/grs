import { useState, useEffect, useCallback, useRef } from 'react';

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

interface StudentDashboardData {
  courses: Course[];
  availableCredits: number;
  usedCredits: number;
  completedCourses: Course[];
  enrolledCourses: Course[];
  loading: boolean;
  error: string | null;
  courseCount: number;
  completedCourseCount: number;
  enrolledCourseCount: number;
  refreshData: () => Promise<void>;
}

export const useStudentDashboardData = (studentId: string): StudentDashboardData => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [usedCredits, setUsedCredits] = useState<number>(0);
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Guard against concurrent/infinite fetches
  const isFetchingRef = useRef<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!studentId) {
      setError('Student ID is required');
      return;
    }
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      } as const;

      // Courses
      const coursesRes = await fetch(`http://localhost:3000/student/${studentId}/courses`, { headers });
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(Array.isArray(data.data) ? data.data : []);
      }

      // Available credits
      const availRes = await fetch(`http://localhost:3000/student/${studentId}/available-credits`, { headers });
      if (availRes.ok) {
        const data = await availRes.json();
        setAvailableCredits(Number(data?.available_credit ?? 0));
      }

      // Used credits
      const usedRes = await fetch(`http://localhost:3000/student/${studentId}/used-credits`, { headers });
      if (usedRes.ok) {
        const data = await usedRes.json();
        setUsedCredits(Number(data?.used_credit ?? 0));
      }

      // Completed courses
      const completedRes = await fetch(`http://localhost:3000/student/${studentId}/completed-courses`, { headers });
      if (completedRes.ok) {
        const data = await completedRes.json();
        setCompletedCourses(Array.isArray(data.data) ? data.data : []);
      }

      // Enrolled courses
      const enrolledRes = await fetch(`http://localhost:3000/student/${studentId}/enrolled-courses`, { headers });
      if (enrolledRes.ok) {
        const data = await enrolledRes.json();
        setEnrolledCourses(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
    // Only re-run when studentId changes; fetchData is stable due to dependency array
  }, [studentId, fetchData]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    courses,
    availableCredits,
    usedCredits,
    completedCourses,
    enrolledCourses,
    loading,
    error,
    courseCount: courses.length,
    completedCourseCount: completedCourses.length,
    enrolledCourseCount: enrolledCourses.length,
    refreshData,
  };
};
