import { useCallback, useEffect, useState } from 'react';

interface Umbrella {
  _id: string;
  name: string;
}

interface UseBPRNDUmbrellasResult {
  umbrellas: Umbrella[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBPRNDUmbrellas(): UseBPRNDUmbrellasResult {
  const [umbrellas, setUmbrellas] = useState<Umbrella[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUmbrellas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    try {
      const response = await fetch('http://localhost:3004/umbrellas', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(
          response.status === 404
            ? 'Umbrellas not found'
            : text?.slice(0, 120) || 'Unexpected non-JSON response'
        );
      }

      const json = await response.json();
      if (!response.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to fetch umbrellas');
      }

      setUmbrellas(json.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error fetching umbrellas';
      setError(message);
      setUmbrellas([]);
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetchUmbrellas();
  }, [fetchUmbrellas]);

  return { umbrellas, isLoading, error, refetch: fetchUmbrellas };
}

export default useBPRNDUmbrellas;
