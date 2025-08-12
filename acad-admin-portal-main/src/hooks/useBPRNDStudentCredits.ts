import { useCallback, useEffect, useMemo, useState } from 'react';

interface UseBPRNDStudentCreditsResult {
  totalCredits: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches total credits for a BPRND student from API4
 * Endpoint: GET http://localhost:3004/student/:id/credits
 */
export function useBPRNDStudentCredits(studentId: string | null | undefined): UseBPRNDStudentCreditsResult {
  const [totalCredits, setTotalCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(() => Boolean(studentId && studentId.trim().length > 0), [studentId]);

  const fetchCredits = useCallback(async () => {
    if (!canFetch) {
      setError('Missing student ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    try {
      const response = await fetch(`http://localhost:3004/student/${studentId}/credits`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        // Non-JSON response (likely HTML error page)
        const text = await response.text();
        throw new Error(
          response.status === 404
            ? 'Student not found'
            : text?.slice(0, 120) || 'Unexpected non-JSON response'
        );
      }

      const json = await response.json();

      if (!response.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to fetch credits');
      }

      setTotalCredits(
        typeof json?.data?.totalCredits === 'number' ? json.data.totalCredits : null
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error fetching credits';
      setError(message);
      setTotalCredits(null);
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [studentId, canFetch]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    totalCredits,
    isLoading,
    error,
    refetch: fetchCredits,
  };
}

export default useBPRNDStudentCredits;


