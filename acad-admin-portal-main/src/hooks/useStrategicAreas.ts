import { useState, useCallback } from 'react';

interface StrategicArea {
  _id: string;
  name: string;
  count: number;
  link: string;
}

interface UseStrategicAreasReturn {
  strategicAreas: StrategicArea[];
  loading: boolean;
  error: string | null;
  fetchStrategicAreas: () => Promise<void>;
}

export const useStrategicAreas = (): UseStrategicAreasReturn => {
  const [strategicAreas, setStrategicAreas] = useState<StrategicArea[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategicAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching strategic areas...');

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
      console.log('Strategic areas data received:', data);
      
      if (data.success) {
        setStrategicAreas(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch strategic areas');
      }
    } catch (err) {
      console.error('Error fetching strategic areas:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch strategic areas');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    strategicAreas,
    loading,
    error,
    fetchStrategicAreas
  };
}; 