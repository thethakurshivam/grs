import { useState, useEffect } from 'react';

interface Field {
  id: string;
  nameOfTheField: string;
  count: number;
  link: string;
}

interface FieldsResponse {
  success: boolean;
  count: number;
  data: Field[];
}

export const useFields = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('Token found:', !!token);
      
      if (!token) {
        console.log('No authentication token found');
        setLoading(false);
        setFields([]);
        setCount(0);
        return; // Don't throw error, just return empty data
      }

      console.log('Making API request to:', 'http://localhost:3000/api/fields');
      
      const response = await fetch('http://localhost:3000/api/fields', {
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
        
        // If it's an authentication error, don't break the component
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication error - user may need to log in');
          setLoading(false);
          setFields([]);
          setCount(0);
          return; // Don't throw error, just return empty data
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: FieldsResponse = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setFields(data.data);
        setCount(data.count);
        console.log('Successfully fetched', data.count, 'fields');
      } else {
        throw new Error(data.error || 'Failed to fetch fields');
      }
    } catch (err) {
      console.error('Error in fetchFields:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setFields([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  return {
    fields,
    count,
    loading,
    error,
    refetch: fetchFields
  };
}; 