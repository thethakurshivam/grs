import { useCallback, useRef, useState } from 'react';

export interface POCCourse {
  _id: string;
  ID?: string;
  courseName: string;
  organization?: string;
  duration?: string;
  indoorCredits?: number;
  outdoorCredits?: number;
  startDate?: string;
  endDate?: string;
  completionStatus?: string;
  mou_id?: string;
  description?: string;
}

export interface UsePOCCoursesReturn {
  courses: POCCourse[];
  count: number;
  loading: boolean;
  error: string | null;
  fetchCourses: (pocId: string) => Promise<void>;
}

export const usePOCCourses = (): UsePOCCoursesReturn => {
  const [courses, setCourses] = useState<POCCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);

  const isFetchingRef = useRef<boolean>(false);
  const lastPocIdRef = useRef<string | null>(null);

  const fetchCourses = useCallback(async (pocId: string) => {
    if (!pocId) {
      setError('POC ID is required');
      return;
    }
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('pocToken');
      const baseUrl = 'http://localhost:3002'; // api2.js commonly runs on 3002
      const res = await fetch(`${baseUrl}/api/poc/${pocId}/courses`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      // Accept either array or object with data property
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setCourses(list);
      setCount(list.length);
      lastPocIdRef.current = pocId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch POC courses');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  return { courses, count, loading, error, fetchCourses };
};
