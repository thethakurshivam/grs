import { useCallback, useEffect, useMemo, useState } from 'react';

// Dynamic interface that will be built based on actual umbrella fields
export interface BprndCreditBreakdown {
  [key: string]: number;
}

interface UseBPRNDCreditBreakdownResult {
  data: BprndCreditBreakdown | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBPRNDCreditBreakdown(studentId: string | null | undefined): UseBPRNDCreditBreakdownResult {
  const [data, setData] = useState<BprndCreditBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(() => Boolean(studentId && studentId.trim().length > 0), [studentId]);

  const fetchBreakdown = useCallback(async () => {
    if (!canFetch) {
      setError('Missing student ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    try {
      const response = await fetch(`http://localhost:3004/student/${studentId}/credits/breakdown`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(
          response.status === 404
            ? 'Student not found'
            : text?.slice(0, 120) || 'Unexpected non-JSON response'
        );
      }

      const json = await response.json();
      if (!response.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to fetch credits breakdown');
      }

      setData(json.data as BprndCreditBreakdown);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error fetching credits breakdown';
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [studentId, canFetch]);

  useEffect(() => {
    fetchBreakdown();
  }, [fetchBreakdown]);

  return { data, isLoading, error, refetch: fetchBreakdown };
}

export default useBPRNDCreditBreakdown;


