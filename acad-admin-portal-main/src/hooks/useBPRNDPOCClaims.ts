import { useState, useEffect, useCallback } from 'react';

interface BPRNDClaim {
  _id: string;
  studentId: string;
  studentName: string;
  umbrellaKey: string;
  qualification: 'certificate' | 'diploma' | 'pg diploma';
  requiredCredits: number;
  status: 'pending' | 'admin_approved' | 'poc_approved' | 'approved' | 'declined';
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

interface UseBPRNDPOCClaimsReturn {
  claims: BPRNDClaim[];
  count: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBPRNDPOCClaims = (): UseBPRNDPOCClaimsReturn => {
  const [claims, setClaims] = useState<BPRNDClaim[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('pocToken');
      if (!token) {
        throw new Error('Missing POC token');
      }

      const response = await fetch('http://localhost:3003/api/bprnd/claims', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch claims');
      }

      setClaims(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch certification claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return {
    claims,
    count: claims.length,
    loading,
    error,
    refetch: fetchClaims,
  };
};
