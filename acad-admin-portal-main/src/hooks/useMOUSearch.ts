import { useState, useCallback } from 'react';

interface MOU {
  _id: string;
  ID: string;
  nameOfPartnerInstitution: string;
  school: string;
  strategicAreas: string;
  dateOfSigning: string;
  validity: string;
  affiliationDate: string;
}

interface UseMOUSearchReturn {
  searchResults: MOU[];
  loading: boolean;
  error: string | null;
  searchMOUByOrganization: (organizationName: string) => Promise<void>;
}

export const useMOUSearch = (): UseMOUSearchReturn => {
  const [searchResults, setSearchResults] = useState<MOU[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchMOUByOrganization = useCallback(async (organizationName: string) => {
    if (!organizationName.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3002/api/mous/search/${encodeURIComponent(organizationName)}`, {
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
        setSearchResults(data.data);
      } else {
        setError(data.error || 'Failed to search MOUs');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching MOUs:', err);
      setError(err instanceof Error ? err.message : 'Failed to search MOUs');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchMOUByOrganization
  };
}; 