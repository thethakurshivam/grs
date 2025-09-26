import { useState, useEffect, useCallback } from 'react';

interface DeclinedRequestsCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}

export const useBPRNDDeclinedRequestsCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('pocToken');
      if (!token) {
        setError('No POC token found');
        return;
      }

      const response = await fetch('http://localhost:3000/bprnd-poc/declined-requests/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DeclinedRequestsCountResponse = await response.json();
      
      if (data.success) {
        setCount(data.data.count);
      } else {
        setError(data.message || 'Failed to fetch declined requests count');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch declined requests count');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Refresh count every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return {
    count,
    loading,
    error,
    refetch: fetchCount,
  };
};
