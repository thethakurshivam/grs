import { useState, useEffect } from 'react';

interface MOU {
  _id: string;
  ID: string;
  school: string;
  nameOfPartnerInstitution: string;
  strategicAreas: string;
  dateOfSigning: string;
  validity: string;
  affiliationDate: string;
  createdAt: string;
  updatedAt: string;
}

interface MOUResponse {
  success: boolean;
  count: number;
  data: MOU[];
}

interface SingleMOUResponse {
  success: boolean;
  data: MOU;
}

export const useMOU = () => {
  const [mous, setMous] = useState<MOU[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMOU = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('Token found:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Making API request to:', 'http://localhost:3000/api/mous');
      
      const response = await fetch('http://localhost:3000/api/mous', {
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

      const data: MOUResponse = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setMous(data.data);
        setCount(data.count);
        console.log('Successfully fetched', data.count, 'MOUs');
      } else {
        throw new Error(data.error || 'Failed to fetch MOUs');
      }
    } catch (err) {
      console.error('Error in fetchMOU:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMous([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchMOUById = async (mouId: string): Promise<MOU | null> => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`http://localhost:3000/api/mous/${mouId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SingleMOUResponse = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch MOU');
      }
    } catch (err) {
      console.error('Error in fetchMOUById:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchMOU();
  }, []);

  return {
    mous,
    count,
    loading,
    error,
    refetch: fetchMOU,
    fetchMOUById
  };
}; 