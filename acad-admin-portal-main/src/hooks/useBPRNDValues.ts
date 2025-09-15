import { useCallback, useEffect, useState } from 'react';

export interface BprndValueItem {
  _id: string;
  credit: number;
  qualification: string;
}

export function useBPRNDValues() {
  const [data, setData] = useState<BprndValueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchValues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch('http://localhost:3004/api/bprnd/values', { signal: controller.signal });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const t = await res.text();
        throw new Error(t?.slice(0, 160) || 'Unexpected non-JSON response');
      }
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to load certifications');
      }
      setData(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error fetching certifications';
      setError(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetchValues();
  }, [fetchValues]);

  return { data, isLoading, error, refetch: fetchValues };
}

export default useBPRNDValues;


