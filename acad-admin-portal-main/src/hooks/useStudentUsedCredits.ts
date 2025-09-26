import { useState, useCallback } from 'react';

interface UseStudentUsedCreditsReturn {
  usedCredits: number;
  loading: boolean;
  error: string | null;
  fetchUsedCredits: (studentId: string) => Promise<void>;
}

export const useStudentUsedCredits = (): UseStudentUsedCreditsReturn => {
  const [usedCredits, setUsedCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsedCredits = useCallback(async (studentId: string) => {
    if (!studentId) {
      setError('Student ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('studentToken');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3000/student/${studentId}/used-credits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsedCredits(data.used_credit || 0);
    } catch (err) {
      console.error('Error fetching used credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch used credits');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    usedCredits,
    loading,
    error,
    fetchUsedCredits
  };
}; 