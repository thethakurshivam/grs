import { useCallback, useRef, useState } from 'react';

export interface POCMOU {
  _id: string;
  title?: string;
  organization?: string;
  strategicAreas?: string;
  dateOfSigning?: string;
  validity?: string;
  status?: string;
  type?: string;
  description?: string;
}

export interface UsePOCMOUsReturn {
  mous: POCMOU[];
  count: number;
  loading: boolean;
  error: string | null;
  fetchMOUs: (pocId: string) => Promise<void>;
}

export const usePOCMOUs = (): UsePOCMOUsReturn => {
  const [mous, setMOUs] = useState<POCMOU[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);

  const isFetchingRef = useRef<boolean>(false);
  const lastPocIdRef = useRef<string | null>(null);

  const fetchMOUs = useCallback(async (pocId: string) => {
    if (!pocId) {
      setError('POC ID is required');
      return;
    }
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('pocToken');
      const baseUrl = 'http://localhost:3002';
      const res = await fetch(`${baseUrl}/api/poc/${pocId}/mous`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setMOUs(list);
      setCount(list.length);
      lastPocIdRef.current = pocId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch POC MOUs');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  return { mous, count, loading, error, fetchMOUs };
};
