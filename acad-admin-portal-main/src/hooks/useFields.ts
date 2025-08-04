import { useState, useCallback } from 'react';

interface Field {
  _id: string;
  name: string;
  count: number;
}

interface UseFieldsReturn {
  fields: Field[];
  loading: boolean;
  error: string | null;
  fetchFields: () => Promise<void>;
}

export const useFields = (): UseFieldsReturn => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching fields...');

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No auth token found');
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      console.log('Making request to /api/fields with token:', token.substring(0, 15) + '...');
      
      const response = await fetch('http://localhost:3000/api/fields', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Fields data received:', data);
      
      if (data.success) {
        setFields(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch fields');
      }
    } catch (err) {
      console.error('Error fetching fields:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch fields');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fields,
    loading,
    error,
    fetchFields
  };
};