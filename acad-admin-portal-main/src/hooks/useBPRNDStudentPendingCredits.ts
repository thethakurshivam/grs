import { useCallback, useEffect, useMemo, useState } from 'react';

export interface StudentPendingCreditItem {
  id: string;
  studentId?: string;
  name: string;
  organization: string;
  discipline: string;
  theoryHours: number;
  practicalHours: number;
  totalHours: number;
  calculatedCredits: number;
  noOfDays: number;
  pdf: string | null;
  status: string;
  admin_approved: boolean;
  bprnd_poc_approved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseBPRNDStudentPendingCreditsResult {
  data: StudentPendingCreditItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBPRNDStudentPendingCredits(studentId: string | null | undefined): UseBPRNDStudentPendingCreditsResult {
  const [data, setData] = useState<StudentPendingCreditItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(() => Boolean(studentId && studentId.trim().length > 0), [studentId]);

  const fetchData = useCallback(async () => {
    if (!canFetch) {
      setError('Missing student ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    
    try {
      // Call the student-specific endpoint from API4
      const res = await fetch(`http://localhost:3004/api/bprnd/pending-credits/student/${studentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(text?.slice(0, 160) || 'Unexpected non-JSON response');
      }

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to load pending credits');
      }

      setData(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
    
    return () => controller.abort();
  }, [studentId, canFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export default useBPRNDStudentPendingCredits;
