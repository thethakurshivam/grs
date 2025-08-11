import { useState, useEffect } from 'react';

interface Participant {
  _id: string;
  sr_no: number;
  batch_no: string;
  rank: string;
  serial_number: string;
  enrollment_number: string;
  full_name: string;
  gender: string;
  dob: Date;
  birth_place: string;
  birth_state: string;
  country: string;
  aadhar_no: string;
  mobile_no: string;
  alternate_number?: string;
  email: string;
  password: string;
  address: string;
  mou_id: string;
  course_id: string[];
  credits: number;
  available_credit: number;
  used_credit: number;
  createdAt: string;
  updatedAt: string;
}

interface ParticipantsResponse {
  success: boolean;
  data: {
    students: Participant[];
    poc: any;
  };
  error?: string;
}

export const useParticipants = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Debug function to check local storage
  const debugAuth = () => {
    const pocToken = localStorage.getItem('pocToken');
    const pocId = localStorage.getItem('pocUserId');
    const pocUser = localStorage.getItem('pocUser');

    console.log('=== AUTH DEBUG ===');
    console.log('POC Token:', pocToken ? 'Present' : 'Missing');
    console.log('POC ID:', pocId);
    if (pocUser) {
      try {
        console.log('POC User:', JSON.parse(pocUser));
      } catch (e) {
        console.log('POC User: Invalid JSON');
      }
    } else {
      console.log('POC User: Missing');
    }
    return { pocToken, pocId, pocUser };
  };

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);

      // Force console logs to appear
      console.warn('=== START FETCHING PARTICIPANTS ===');

      // Get auth data
      const token = localStorage.getItem('pocToken');
      const pocId = localStorage.getItem('pocUserId');
      const pocUser = localStorage.getItem('pocUser');

      // Log auth status
      console.warn('Auth Status:', {
        hasToken: !!token,
        pocId: pocId,
        hasUser: !!pocUser,
      });

      if (!token || !pocId) {
        throw new Error('Authentication required. Please log in again.');
      }
      console.log('=== POC ID FOUND ===');
      console.log('POC ID:', pocId);

      if (!pocId) {
        throw new Error('POC ID not found in token');
      }

      console.log(
        'Making API request to:',
        `http://localhost:3002/api/poc/${pocId}/students`
      );
      console.log('POC ID:', pocId);

      // Prepare request URL and headers
      const apiUrl = `http://localhost:3002/api/poc/${pocId}/students`;
      console.warn('Making request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: window.location.origin,
        },
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Get and log response details
      console.warn('Response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      const responseText = await response.text();
      console.warn('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${responseText}`
        );
      }

      // Parse and validate response
      const data: ParticipantsResponse = JSON.parse(responseText);
      console.warn('Parsed response:', {
        success: data.success,
        studentCount: data.data?.students?.length || 0,
        hasPocData: !!data.data?.poc,
      });

      if (data.success) {
        setParticipants(data.data.students);
        setCount(data.data.students.length);
        console.log(
          'Successfully fetched',
          data.data.students.length,
          'participants'
        );
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
    refetch: fetchParticipants,
  };
};
