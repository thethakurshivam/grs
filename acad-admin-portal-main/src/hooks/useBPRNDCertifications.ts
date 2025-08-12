import { useCallback, useEffect, useMemo, useState } from 'react';

export interface CertificationEligibilityItem {
  fieldKey: string;
  field: string;
  credits: number;
  qualification: string; // certificate | diploma | pg diploma
  claimUrl: string;
}

export function useBPRNDCertifications(studentId: string | null | undefined) {
  const [data, setData] = useState<CertificationEligibilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(() => Boolean(studentId && studentId.trim()), [studentId]);

  const fetchData = useCallback(async () => {
    if (!canFetch) {
      setError('Missing student ID');
      return;
    }
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch(`http://localhost:3004/student/${studentId}/certifications`, { signal: controller.signal });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const t = await res.text();
        throw new Error(t?.slice(0, 160) || 'Unexpected non-JSON response');
      }
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to load eligibility');
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

export default useBPRNDCertifications;


