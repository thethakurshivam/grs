import { useState, useCallback } from 'react';

interface UseMOUOrganizationsReturn {
  organizations: string[];
  loading: boolean;
  error: string | null;
  fetchOrganizations: () => Promise<void>;
}

export const useMOUOrganizations = (): UseMOUOrganizationsReturn => {
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3002/api/mous/organizations', {
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
        setOrganizations(data.data);
      } else {
        setError(data.error || 'Failed to fetch organizations');
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    organizations,
    loading,
    error,
    fetchOrganizations
  };
}; 