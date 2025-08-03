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

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/fields', {
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