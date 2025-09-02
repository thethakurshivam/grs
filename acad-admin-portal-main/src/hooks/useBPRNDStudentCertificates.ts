import { useState, useCallback } from 'react';

interface BPRNDCertificate {
  _id: string;
  studentId: string;
  umbrellaKey: string;
  qualification: string;
  claimId: string;
  issuedAt: string;
  certificateNo: string;
  createdAt: string;
  updatedAt: string;
}

interface UseBPRNDStudentCertificatesReturn {
  certificates: BPRNDCertificate[];
  loading: boolean;
  error: string | null;
  fetchCertificates: (studentId: string) => Promise<void>;
  clearError: () => void;
}

export const useBPRNDStudentCertificates = (): UseBPRNDStudentCertificatesReturn => {
  const [certificates, setCertificates] = useState<BPRNDCertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async (studentId: string) => {
    if (!studentId) {
      setError('Student ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching BPRND student certificates for ID:', studentId);

      const response = await fetch(`http://localhost:3004/student/${studentId}/certificates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCertificates(data.data);
        console.log('BPRND student certificates loaded:', {
          count: data.count,
          certificates: data.data
        });
      } else {
        const errorMessage = data.message || 'Failed to fetch student certificates';
        setError(errorMessage);
        console.error('BPRND certificates fetch error:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      setError(errorMessage);
      console.error('BPRND certificates fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    certificates,
    loading,
    error,
    fetchCertificates,
    clearError,
  };
};
