import { useState, useEffect } from 'react';

interface UseStudentAvailableCreditsReturn {
  availableCredits: number;
  loading: boolean;
  error: string | null;
  fetchAvailableCredits: (studentId: string) => Promise<void>;
}

export const useStudentAvailableCredits = (): UseStudentAvailableCreditsReturn => {
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableCredits = async (studentId: string) => {
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

      const response = await fetch(`http://localhost:3001/students/${studentId}/available-credits`, {
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
      setAvailableCredits(data.available_credit || 0);
    } catch (err) {
      console.error('Error fetching available credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch available credits');
    } finally {
      setLoading(false);
    }
  };

  return {
    availableCredits,
    loading,
    error,
    fetchAvailableCredits
  };
}; 