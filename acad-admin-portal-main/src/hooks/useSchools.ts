import { useState, useEffect } from 'react';

interface School {
  id: string;
  name: string;
  count: number;
  link: string;
}

interface SchoolsResponse {
  success: boolean;
  count: number;
  data: School[];
}

export const useSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('Token found:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Making API request to:', 'http://localhost:3000/api/schools');
      
      const response = await fetch('http://localhost:3000/api/schools', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: SchoolsResponse = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setSchools(data.data);
        setCount(data.count);
        console.log('Successfully fetched', data.count, 'schools');
      } else {
        throw new Error(data.error || 'Failed to fetch schools');
      }
    } catch (err) {
      console.error('Error in fetchSchools:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSchools([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return {
    schools,
    count,
    loading,
    error,
    refetch: fetchSchools
  };
}; 