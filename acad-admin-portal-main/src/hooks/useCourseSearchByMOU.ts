import { useState, useCallback } from 'react';

interface Course {
  _id: string;
  ID: string;
  courseName: string;
  organization: string;
  duration: string;
  indoorCredits: number;
  outdoorCredits: number;
  field: any;
  startDate: string;
  completionStatus: string;
  mou_id: string;
  subjects: any[];
}

export const useCourseSearchByMOU = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByMOU = useCallback(async (mouId: string, status?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let url = `http://localhost:3002/api/courses/mou/${mouId}`;
      if (status) {
        url += `?status=${status}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCourses(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { courses, loading, error, searchByMOU };
}; 