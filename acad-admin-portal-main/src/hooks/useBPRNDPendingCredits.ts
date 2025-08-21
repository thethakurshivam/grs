import { useCallback, useEffect, useMemo, useState } from 'react';

export interface PendingCreditItem {
  id: string;
  studentId?: string;
  name: string;
  organization: string;
  discipline: string;
  theoryHours?: number;
  practicalHours?: number;
  theoryCredits?: number;
  practicalCredits?: number;
  totalHours: number;
  calculatedCredits?: number;
  noOfDays: number;
  pdf: string | null;
  acceptUrl: string;
  rejectUrl: string;
}

interface UseBPRNDPendingCreditsResult {
  data: PendingCreditItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBPRNDPendingCredits(): UseBPRNDPendingCreditsResult {
  const [data, setData] = useState<PendingCreditItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(
    () => 'http://localhost:3003/api/bprnd/pending-credits',
    []
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch(endpoint, {
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
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export default useBPRNDPendingCredits;


