import { useState, useCallback } from 'react';

interface School {
  _id: string;
  name: string;
  count: number;
}

interface UseSchoolsFromAdminAPIReturn {
  schools: School[];
  loading: boolean;
  error: string | null;
  fetchSchools: () => Promise<void>;
}

export const useSchoolsFromAPI1 = (): UseSchoolsFromAdminAPIReturn => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3002/api/schools-all', {
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
      
      if (data.success) {
        setSchools(data.data);
      } else {
        setError(data.error || 'Failed to fetch schools');
      }
    } catch (err) {
      console.error('Error fetching schools from admin API:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schools,
    loading,
    error,
    fetchSchools
  };
}; 