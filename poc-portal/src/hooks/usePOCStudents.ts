import { useCallback, useRef, useState } from 'react';

export interface POCStudent {
  _id: string;
  full_name?: string;
  email?: string;
  mobile_no?: string;
  enrollment_number?: string;
  mou_id?: string;
  course_id?: string[];
  status?: string;
}

export interface UsePOCStudentsReturn {
  students: POCStudent[];
  count: number;
  loading: boolean;
  error: string | null;
  fetchStudents: (pocId: string) => Promise<void>;
}

export const usePOCStudents = (): UsePOCStudentsReturn => {
  const [students, setStudents] = useState<POCStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);

  const isFetchingRef = useRef<boolean>(false);

  const fetchStudents = useCallback(async (pocId: string) => {
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
      const baseUrl = 'http://localhost:3002';
      const res = await fetch(`${baseUrl}/api/poc/${pocId}/students`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data?.students) ? data.data.students : [];
      setStudents(list);
      setCount(list.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch POC students');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  return { students, count, loading, error, fetchStudents };
};
