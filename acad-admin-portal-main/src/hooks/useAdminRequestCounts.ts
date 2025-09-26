import { useCallback, useEffect, useState } from 'react';

export interface AdminRequestCounts {
  pendingCreditsCount: number;
  pendingCertificationCount: number;
}

interface UseAdminRequestCountsResult {
  data: AdminRequestCounts | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminRequestCounts(): UseAdminRequestCountsResult {
  const [data, setData] = useState<AdminRequestCounts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    console.log('🔍 useAdminRequestCounts: Starting to fetch counts...');

    const controller = new AbortController();
    try {
      // Fetch both counts in parallel
      console.log('🔍 useAdminRequestCounts: Making API calls to:', [
        'http://localhost:3000/admin/pending-credits/count',
        'http://localhost:3000/admin/bprnd-claims/count'
      ]);
      
      // Get admin authentication token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('❌ useAdminRequestCounts: No auth token found');
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      console.log('🔍 useAdminRequestCounts: Using auth token:', authToken.substring(0, 20) + '...');

      const [pendingCreditsResponse, pendingCertificationResponse] = await Promise.all([
        fetch('http://localhost:3000/admin/pending-credits/count', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          signal: controller.signal,
        }),
        fetch('http://localhost:3000/admin/bprnd-claims/count', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          signal: controller.signal,
        })
      ]);

      console.log('🔍 useAdminRequestCounts: Response statuses:', {
        pendingCredits: pendingCreditsResponse.status,
        pendingCertification: pendingCertificationResponse.status
      });
      
      // Check if both requests were successful
      if (!pendingCreditsResponse.ok || !pendingCertificationResponse.ok) {
        console.error('❌ useAdminRequestCounts: One or both requests failed');
        console.error('❌ Pending Credits Status:', pendingCreditsResponse.status, pendingCreditsResponse.statusText);
        console.error('❌ Certification Claims Status:', pendingCertificationResponse.status, pendingCertificationResponse.statusText);
        throw new Error('Failed to fetch request counts');
      }

      const [pendingCreditsData, pendingCertificationData] = await Promise.all([
        pendingCreditsResponse.json(),
        pendingCertificationResponse.json()
      ]);

      console.log('🔍 useAdminRequestCounts: Response data:', {
        pendingCredits: pendingCreditsData,
        pendingCertification: pendingCertificationData
      });

      if (!pendingCreditsData.success || !pendingCertificationData.success) {
        console.error('❌ useAdminRequestCounts: One or both responses indicate failure');
        console.error('❌ Pending Credits Success:', pendingCreditsData.success, pendingCreditsData.error || pendingCreditsData.message);
        console.error('❌ Certification Claims Success:', pendingCertificationData.success, pendingCertificationData.error || pendingCertificationData.message);
        throw new Error('Failed to parse request count data');
      }

      const result = {
        pendingCreditsCount: pendingCreditsData.data.count || 0,
        pendingCertificationCount: pendingCertificationData.data.count || 0
      };
      
      console.log('✅ useAdminRequestCounts: Setting data:', result);
      console.log('🎯 Badge should show for:');
      console.log('  - Pending Credits:', result.pendingCreditsCount > 0 ? `YES (${result.pendingCreditsCount})` : 'NO');
      console.log('  - Certification Claims:', result.pendingCertificationCount > 0 ? `YES (${result.pendingCertificationCount})` : 'NO');
      
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error fetching request counts';
      console.error('❌ useAdminRequestCounts: Error:', err);
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

export default useAdminRequestCounts;
