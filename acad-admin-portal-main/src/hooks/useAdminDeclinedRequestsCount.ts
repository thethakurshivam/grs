import { useState, useEffect, useCallback } from 'react';

interface AdminDeclinedRequestsCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}

export const useAdminDeclinedRequestsCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No admin token found');
        return;
      }

      const response = await fetch('http://localhost:3000/admin/declined-requests/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AdminDeclinedRequestsCountResponse = await response.json();
      
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
