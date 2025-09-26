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

interface School {
  _id: string;
  name: string;
  count: number;
}

interface SchoolMOUsResponse {
  success: boolean;
  school: School;
  count: number;
  data: MOU[];
}

export const useSchoolMOUs = (schoolName: string) => {
  const [mous, setMous] = useState<MOU[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolMOUs = async () => {
    if (!schoolName) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('Token found:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const encodedSchoolName = encodeURIComponent(schoolName);
      console.log('Making API request to:', `http://localhost:3000/admin/schools/${encodedSchoolName}`);
      
      const response = await fetch(`http://localhost:3000/admin/schools/${encodedSchoolName}`, {
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

      const data: SchoolMOUsResponse = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setMous(data.data);
        setSchool(data.school);
        setCount(data.count);
        console.log('Successfully fetched', data.count, 'MOUs for school:', schoolName);
      } else {
        throw new Error(data.error || 'Failed to fetch school MOUs');
      }
    } catch (err) {
      console.error('Error in fetchSchoolMOUs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMous([]);
      setSchool(null);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolMOUs();
  }, [schoolName]);

  return {
    mous,
    school,
    count,
    loading,
    error,
    refetch: fetchSchoolMOUs
  };
}; 