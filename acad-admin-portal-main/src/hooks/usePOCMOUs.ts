import { useState, useEffect } from 'react';

interface POCMOU {
  _id: string;
  ID: string;
  school: string;
  nameOfPartnerInstitution: string;
  strategicAreas: string;
  dateOfSigning: string;
  validity: string;
  affiliationDate: string;
}

interface POCData {
  _id: string;
  name: string;
  email: string;
  organization: string;
  mous: POCMOU[];
}

interface POCMOUsResponse {
  success: boolean;
  data: {
    poc: POCData;
    mous: POCMOU[];
  };
}

export const usePOCMOUs = () => {
  const [mous, setMous] = useState<POCMOU[]>([]);
  const [pocData, setPocData] = useState<POCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMOUs = async () => {
    try {
      setLoading(true);
      setError(null);

      const pocToken = localStorage.getItem('pocToken');
      const pocUserId = localStorage.getItem('pocUserId');

      if (!pocToken || !pocUserId) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3000/poc/${pocUserId}/mous`, {
        headers: {
          'Authorization': `Bearer ${pocToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed');
        } else if (response.status === 403) {
          setError('Access denied. You can only access your own data.');
        } else if (response.status === 404) {
          setError('POC not found');
        } else {
          setError('Failed to fetch MOUs');
        }
        setLoading(false);
        return;
      }

      const data: POCMOUsResponse = await response.json();
      
      if (data.success) {
        setMous(data.data.mous);
        setPocData(data.data.poc);
      } else {
        setError('Failed to fetch MOUs');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching POC MOUs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMOUs();
  }, []);

  return {
    mous,
    pocData,
    loading,
    error,
    refetch: fetchMOUs,
  };
}; 