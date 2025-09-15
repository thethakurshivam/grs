import { useCallback, useEffect, useState } from 'react';

export interface AdminBPRNDClaimItem {
  _id: string;
  studentId: string;
  studentName: string;
  umbrellaKey: string;
  qualification: 'certificate' | 'diploma' | 'pg diploma';
  requiredCredits: number;
  status: 'pending' | 'admin_approved' | 'poc_approved' | 'approved' | 'declined';
  poc_approved: boolean;
  admin_approved: boolean;
  createdAt: string;
  updatedAt: string;
  adminApproval?: {
    by?: string;
    at?: string;
    decision?: string;
  };
  pocApproval?: {
    by?: string;
    at?: string;
    decision?: string;
  };
}

interface UseAdminBPRNDClaimsResult {
  data: AdminBPRNDClaimItem[];
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminBPRNDClaims(): UseAdminBPRNDClaimsResult {
  const [data, setData] = useState<AdminBPRNDClaimItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    console.log('🔍 useAdminBPRNDClaims: Starting to fetch BPRND claims...');

    const controller = new AbortController();
    try {
      // Get admin authentication token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('❌ useAdminBPRNDClaims: No auth token found');
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      console.log('🔍 useAdminBPRNDClaims: Using auth token:', authToken.substring(0, 20) + '...');

      const response = await fetch('http://localhost:3002/api/bprnd/claims', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        signal: controller.signal,
      });

      console.log('🔍 useAdminBPRNDClaims: Response status:', response.status);

      if (!response.ok) {
        console.error('❌ useAdminBPRNDClaims: Request failed:', response.status, response.statusText);
        throw new Error('Failed to fetch BPRND claims');
      }

      const json = await response.json();
      console.log('🔍 useAdminBPRNDClaims: Response data:', json);

      if (!json?.success) {
        console.error('❌ useAdminBPRNDClaims: Response indicates failure:', json?.message || json?.error);
        throw new Error(json?.message || 'Failed to load BPRND claims');
      }

      const claimsData = Array.isArray(json.data) ? json.data : [];
      setData(claimsData);
      
      console.log('✅ useAdminBPRNDClaims: Setting data:', {
        count: claimsData.length,
        data: claimsData
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error fetching BPRND claims';
      console.error('❌ useAdminBPRNDClaims: Error:', err);
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
      console.log('🔄 useAdminBPRNDClaims: Polling - refetching data...');
      fetchData();
    }, 5000); // 5 seconds
    
    // Cleanup interval on unmount
    return () => {
      console.log('🧹 useAdminBPRNDClaims: Cleaning up polling interval');
      clearInterval(intervalId);
    };
  }, [fetchData]);

  // Calculate count from data length
  const count = data.length;

  return { data, count, isLoading, error, refetch: fetchData };
}

export default useAdminBPRNDClaims;
