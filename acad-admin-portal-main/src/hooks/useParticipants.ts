import { useState, useEffect } from 'react';

interface Participant {
  _id: string;
  srNo: number;
  batchNo: string;
  rank: string;
  serialNumberRRU: string;
  enrollmentNumber: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  birthPlace: string;
  birthState: string;
  country: string;
  aadharNo: string;
  mobileNumber: string;
  alternateNumber?: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

interface ParticipantsResponse {
  success: boolean;
  count: number;
  data: Participant[];
}

export const useParticipants = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('Token found:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Making API request to:', 'http://localhost:3000/api/participants');
      
      const response = await fetch('http://localhost:3000/api/participants', {
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

      const data: ParticipantsResponse = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setParticipants(data.data);
        setCount(data.count);
        console.log('Successfully fetched', data.count, 'participants');
      } else {
        throw new Error(data.error || 'Failed to fetch participants');
      }
    } catch (err) {
      console.error('Error in fetchParticipants:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setParticipants([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  return {
    participants,
    count,
    loading,
    error,
    refetch: fetchParticipants
  };
}; 