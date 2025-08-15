import { useCallback, useEffect, useState } from 'react';

export interface UmbrellaItem {
  _id: string;
  name: string;
}

export function useBPRNDUmbrellas() {
  const [data, setData] = useState<UmbrellaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUmbrellas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch('http://localhost:3003/api/bprnd/umbrellas', { signal: controller.signal });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(text?.slice(0, 160) || 'Unexpected non-JSON response');
      }
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to load umbrellas');
      }
      setData(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error fetching umbrellas';
      setError(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetchUmbrellas();
  }, [fetchUmbrellas]);

  return { data, isLoading, error, refetch: fetchUmbrellas };
}

export default useBPRNDUmbrellas;
