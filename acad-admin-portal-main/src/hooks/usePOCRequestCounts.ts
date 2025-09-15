import { useCallback, useEffect, useState } from 'react';

export interface POCRequestCounts {
  pendingCreditsCount: number;
  pendingCertificationCount: number;
}

interface UsePOCRequestCountsResult {
  data: POCRequestCounts | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePOCRequestCounts(): UsePOCRequestCountsResult {
  const [data, setData] = useState<POCRequestCounts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    console.log('🔍 usePOCRequestCounts: Starting to fetch counts...');

    const controller = new AbortController();
    try {
      // Get POC authentication token
      const pocToken = localStorage.getItem('pocToken');
      if (!pocToken) {
        console.error('❌ usePOCRequestCounts: No POC token found');
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      console.log('🔍 usePOCRequestCounts: Using POC token:', pocToken.substring(0, 20) + '...');

      // Fetch both counts in parallel
      console.log('🔍 usePOCRequestCounts: Making API calls to:', [
        'http://localhost:3003/api/bprnd/poc/pending-credits/count',
        'http://localhost:3003/api/bprnd/poc/claims/count'
      ]);
      
      const [pendingCreditsResponse, pendingCertificationResponse] = await Promise.all([
        fetch('http://localhost:3003/api/bprnd/poc/pending-credits/count', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pocToken}`
          },
          signal: controller.signal,
        }),
        fetch('http://localhost:3003/api/bprnd/poc/claims/count', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pocToken}`
          },
          signal: controller.signal,
        })
      ]);

      console.log('🔍 usePOCRequestCounts: Response statuses:', {
        pendingCredits: pendingCreditsResponse.status,
        pendingCertification: pendingCertificationResponse.status
      });
      
      // Check if both requests were successful
      if (!pendingCreditsResponse.ok || !pendingCertificationResponse.ok) {
        console.error('❌ usePOCRequestCounts: One or both requests failed');
        throw new Error('Failed to fetch request counts');
      }

      const [pendingCreditsData, pendingCertificationData] = await Promise.all([
        pendingCreditsResponse.json(),
        pendingCertificationResponse.json()
      ]);

      console.log('🔍 usePOCRequestCounts: Response data:', {
        pendingCredits: pendingCreditsData,
        pendingCertification: pendingCertificationData
      });

      if (!pendingCreditsData.success || !pendingCertificationData.success) {
        console.error('❌ usePOCRequestCounts: One or both responses indicate failure');
        throw new Error('Failed to parse request count data');
      }

      const result = {
        pendingCreditsCount: pendingCreditsData.data.count || 0,
        pendingCertificationCount: pendingCertificationData.data.count || 0
      };
      
      console.log('✅ usePOCRequestCounts: Setting data:', result);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error fetching request counts';
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return { data, isLoading, error, refetch: fetchCounts };
}

export default usePOCRequestCounts;
