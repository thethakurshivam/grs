import { useState, useEffect, useCallback } from 'react';

interface UseBPRNDStudentsCountResult {
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useBPRNDStudentsCount = (): UseBPRNDStudentsCountResult => {
  console.log('🚀 useBPRNDStudentsCount hook initialized');
  
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      console.log('🔄 useBPRNDStudentsCount: Fetching students count...');
      setIsLoading(true);
      setError(null);



      console.log('🌐 Making request to /api/bprnd/students');
      const response = await fetch('/api/bprnd/students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Full API Response:', JSON.stringify(data, null, 2));
      
      if (data && data.data && Array.isArray(data.data)) {
        const count = data.data.length;
        console.log('✅ Found data.data array, setting count to:', count);
        setCount(count);
      } else if (Array.isArray(data)) {
        const count = data.length;
        console.log('✅ Found direct array, setting count to:', count);
        setCount(count);
      } else {
        console.log('⚠️ Unexpected data format, setting count to 0. Data type:', typeof data);
        setCount(0);
      }
    } catch (err) {
      console.error('❌ Error in fetchCount:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch students count';
      console.error('❌ Error message:', errorMessage);
      setError(errorMessage);
      setCount(0);
    } finally {
      setIsLoading(false);
      console.log('🏁 Fetch completed, final state:', { isLoading: false });
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Polling every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchCount]);

  return {
    count,
    isLoading,
    error,
    refetch: fetchCount,
  };
};

export default useBPRNDStudentsCount;
