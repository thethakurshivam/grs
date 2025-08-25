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
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBPRNDPendingCredits(): UseBPRNDPendingCreditsResult {
  const [data, setData] = useState<PendingCreditItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(
    () => '/api/bprnd/pending-credits',
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
    
    // Set up polling every 5 seconds for real-time updates
    const intervalId = setInterval(() => {
      console.log('🔄 useBPRNDPendingCredits: Polling - refetching data...');
      fetchData();
    }, 5000); // 5 seconds
    
    // Cleanup interval on unmount
    return () => {
      console.log('🧹 useBPRNDPendingCredits: Cleaning up polling interval');
      clearInterval(intervalId);
    };
  }, [fetchData]);

  // Calculate count from data length
  const count = data.length;

  return { data, count, isLoading, error, refetch: fetchData };
}

export default useBPRNDPendingCredits;


