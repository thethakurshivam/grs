import { useState, useEffect, useCallback } from 'react';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!studentId) {
      setError('Student ID is required');
      return;
    }

    if (isLoading) {
      console.log('Already loading data, skipping request');
      return;
    }

    setIsLoading(true);
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
      };

      // Fetch all data sequentially with delays
      console.log('Fetching student courses...');
      const coursesResponse = await fetch(`http://localhost:3001/student/${studentId}/courses`, {
        method: 'GET',
        headers,
      });
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      } else {
        console.warn('Failed to fetch courses:', coursesResponse.status);
      }
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('Fetching available credits...');
      const availableCreditsResponse = await fetch(`http://localhost:3001/students/${studentId}/available-credits`, {
        method: 'GET',
        headers,
      });
      if (availableCreditsResponse.ok) {
        const availableCreditsData = await availableCreditsResponse.json();
        setAvailableCredits(availableCreditsData.available_credit || 0);
      } else {
        console.warn('Failed to fetch available credits:', availableCreditsResponse.status);
      }
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('Fetching used credits...');
      const usedCreditsResponse = await fetch(`http://localhost:3001/students/${studentId}/used-credits`, {
        method: 'GET',
        headers,
      });
      if (usedCreditsResponse.ok) {
        const usedCreditsData = await usedCreditsResponse.json();
        setUsedCredits(usedCreditsData.used_credit || 0);
      } else {
        console.warn('Failed to fetch used credits:', usedCreditsResponse.status);
      }
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('Fetching completed courses...');
      const completedCoursesResponse = await fetch(`http://localhost:3001/students/${studentId}/completed-courses`, {
        method: 'GET',
        headers,
      });
      if (completedCoursesResponse.ok) {
        const completedCoursesData = await completedCoursesResponse.json();
        setCompletedCourses(completedCoursesData);
      } else {
        console.warn('Failed to fetch completed courses:', completedCoursesResponse.status);
      }
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('Fetching enrolled courses...');
      const enrolledCoursesResponse = await fetch(`http://localhost:3001/students/${studentId}/enrolled-courses`, {
        method: 'GET',
        headers,
      });
      if (enrolledCoursesResponse.ok) {
        const enrolledCoursesData = await enrolledCoursesResponse.json();
        setEnrolledCourses(enrolledCoursesData);
      } else {
        console.warn('Failed to fetch enrolled courses:', enrolledCoursesResponse.status);
      }

      console.log('All data fetched successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [studentId, isLoading]);

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
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
