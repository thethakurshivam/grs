import { useState, useCallback } from 'react';

interface MOU {
  _id: string;
  ID: string;
  nameOfPartnerInstitution: string;
  school: {
    _id: string;
    name: string;
  };
  strategicAreas: string;
  dateOfSigning: string;
  validity: string;
  affiliationDate: string;
}

interface UseMOUSearchBySchoolReturn {
  searchResults: MOU[];
  loading: boolean;
  error: string | null;
  searchMOUBySchool: (schoolId: string) => Promise<void>;
}

export const useMOUSearchBySchool = (): UseMOUSearchBySchoolReturn => {
  const [searchResults, setSearchResults] = useState<MOU[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchMOUBySchool = useCallback(async (schoolId: string) => {
    if (!schoolId.trim()) {
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

      const response = await fetch(`http://localhost:3000/api/mous/school/${encodeURIComponent(schoolId)}`, {
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
      console.error('Error searching MOUs by school:', err);
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
    searchMOUBySchool
  };
}; 