import { useState, useCallback } from 'react';

interface School {
  _id: string;
  name: string;
  count: number;
}

interface UseSchoolsReturn {
  schools: School[];
  loading: boolean;
  error: string | null;
  count: number;
  fetchSchools: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useSchools = (): UseSchoolsReturn => {
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

      const response = await fetch('http://localhost:3000/api/schools', {
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
      console.log('Schools data received:', data);
      
      if (data.success) {
        console.log('Setting schools:', data.data);
        setSchools(data.data);
      } else {
        setError(data.error || 'Failed to fetch schools');
      }
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  }, []);

  const count = schools.length;

  return {
    schools,
    loading,
    error,
    count,
    fetchSchools,
    refetch: fetchSchools
  };
}; 