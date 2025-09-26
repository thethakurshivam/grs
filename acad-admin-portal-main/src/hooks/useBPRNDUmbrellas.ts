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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  const fetchUmbrellas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    try {
      const response = await fetch('http://localhost:3000/bprnd-student/umbrellas', {
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

      // Ensure we always set valid data
      const validUmbrellas = Array.isArray(json.data) ? json.data : [];
      setUmbrellas(validUmbrellas);
      
      // Log for debugging
      console.log('Umbrellas fetched successfully:', validUmbrellas);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch umbrellas';
      setError(errorMessage);
      setUmbrellas([]); // Ensure umbrellas is always an array
      console.error('Error fetching umbrellas:', err);
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
