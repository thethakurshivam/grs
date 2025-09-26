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

      const response = await fetch('http://localhost:3000/admin/pending-credits', {
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

      // Filter requests: POC approved and not admin declined
      const allCredits = Array.isArray(json.data) ? json.data : [];
      
      console.log('🔍 Raw data from backend:', allCredits);
      console.log('🔍 Total credits received:', allCredits.length);
      console.log('🔍 Checking each credit:');
      allCredits.forEach((credit, index) => {
        const willShow = credit.bprnd_poc_approved === true && 
                        (credit.status === 'pending' || credit.status === undefined) &&
                        credit.status !== 'declined' && 
                        credit.status !== 'admin_declined';
        
        console.log(`Credit ${index}:`, {
          id: credit._id,
          name: credit.name,
          poc_approved: credit.bprnd_poc_approved,
          status: credit.status,
          admin_approved: credit.admin_approved,
          willShow,
          statusType: typeof credit.status,
          statusLength: credit.status ? credit.status.length : 'undefined'
        });
      });
      
      const filteredCredits = allCredits.filter(credit => {
        // Condition 1: POC approval must be true
        const condition1 = credit.bprnd_poc_approved === true;
        
        // Condition 2: Status must be 'pending' (ready for admin approval)
        // Also handle undefined status for backward compatibility
        // Filter out any declined statuses (both old 'declined' and new 'admin_declined')
        const condition2 = (credit.status === 'pending' || credit.status === undefined) && 
                          credit.status !== 'declined' && 
                          credit.status !== 'admin_declined';
        
        const willShow = condition1 && condition2;
        
        console.log(`🔍 Filtering credit ${credit._id}:`, {
          name: credit.name,
          poc_approved: credit.bprnd_poc_approved,
          status: credit.status,
          statusType: typeof credit.status,
          admin_approved: credit.admin_approved,
          condition1,
          condition2,
          willShow,
          reason: !condition1 ? 'POC not approved' : 
                  credit.status === 'declined' ? 'Status is declined (old format)' :
                  credit.status === 'admin_declined' ? 'Status is admin_declined' :
                  !condition2 ? `Status is ${credit.status}, not pending or undefined` : 
                  'Will show (ready for admin approval)'
        });
        
        return willShow;
      });
      
      console.log('✅ Filtered credits:', filteredCredits);
      console.log('🔍 Filter criteria: POC approved + status = pending');
      console.log('🔍 Final result - credits that will be displayed:', filteredCredits.map(c => ({ id: c._id, name: c.name, status: c.status })));
      
      setData(filteredCredits);
      
      console.log('✅ useAdminPendingCredits: Setting data:', {
        count: filteredCredits.length,
        data: filteredCredits
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
