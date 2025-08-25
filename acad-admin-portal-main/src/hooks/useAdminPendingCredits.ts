import { useCallback, useEffect, useState } from 'react';

export interface AdminPendingCreditItem {
  _id: string;
  studentId: string;
  name: string;
  organization: string;
  discipline: string;
  theoryHours?: number;
  practicalHours?: number;
  theoryCredits?: number;
  practicalCredits?: number;
  totalHours: number;
  calculatedCredits?: number;
  noOfDays: number;
  pdf: string | null;
  acceptUrl: string;
  rejectUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface UseAdminPendingCreditsResult {
  data: AdminPendingCreditItem[];
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminPendingCredits(): UseAdminPendingCreditsResult {
  const [data, setData] = useState<AdminPendingCreditItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    console.log('🔍 useAdminPendingCredits: Starting to fetch pending credits...');

    const controller = new AbortController();
    try {
      // Get admin authentication token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('❌ useAdminPendingCredits: No auth token found');
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      console.log('🔍 useAdminPendingCredits: Using auth token:', authToken.substring(0, 20) + '...');

      const response = await fetch('/api/pending-credits', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        signal: controller.signal,
      });

      console.log('🔍 useAdminPendingCredits: Response status:', response.status);

      if (!response.ok) {
        console.error('❌ useAdminPendingCredits: Request failed:', response.status, response.statusText);
        throw new Error('Failed to fetch pending credits');
      }

      const json = await response.json();
      console.log('🔍 useAdminPendingCredits: Response data:', json);

      if (!json?.success) {
        console.error('❌ useAdminPendingCredits: Response indicates failure:', json?.message || json?.error);
        throw new Error(json?.message || 'Failed to load pending credits');
      }

      const creditsData = Array.isArray(json.data) ? json.data : [];
      setData(creditsData);
      
      console.log('✅ useAdminPendingCredits: Setting data:', {
        count: creditsData.length,
        data: creditsData
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error fetching pending credits';
      console.error('❌ useAdminPendingCredits: Error:', err);
      setError(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetchData();
    
    // Set up polling every 5 seconds
    const intervalId = setInterval(() => {
      console.log('🔄 useAdminPendingCredits: Polling - refetching data...');
      fetchData();
    }, 5000); // 5 seconds
    
    // Cleanup interval on unmount
    return () => {
      console.log('🧹 useAdminPendingCredits: Cleaning up polling interval');
      clearInterval(intervalId);
    };
  }, [fetchData]);

  // Calculate count from data length
  const count = data.length;

  return { data, count, isLoading, error, refetch: fetchData };
}

export default useAdminPendingCredits;
