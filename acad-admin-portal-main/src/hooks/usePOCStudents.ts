import { useState, useEffect } from 'react';

interface POCStudent {
  _id: string;
  full_name: string;
  email: string;
  enrollment_number?: string;
  gender?: string;
  mobile_no?: string;
  dob?: string;
  birth_place?: string;
  birth_state?: string;
  credits?: number;
  status?: string;
  mou_id: string;
  course_id?: string[];
}

interface POCData {
  _id: string;
  name: string;
  email: string;
  organization: string;
  mous: string[];
}

interface POCStudentsResponse {
  pocData: POCData;
  students: POCStudent[];
}

const usePOCStudents = (pocId: string) => {
  const [students, setStudents] = useState<POCStudent[]>([]);
  const [pocData, setPocData] = useState<POCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    if (!pocId) {
      setError('POC ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3000/poc/${pocId}/students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pocToken') || ''}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You can only access your own data.');
        } else if (response.status === 404) {
          throw new Error('POC not found or no students associated.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: POCStudentsResponse = await response.json();
      setStudents(data.students || []);
      setPocData(data.pocData || null);
    } catch (err) {
      console.error('Error fetching POC students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
      setStudents([]);
      setPocData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [pocId]);

  const refetch = () => {
    fetchStudents();
  };

  return {
    students,
    pocData,
    loading,
    error,
    refetch
  };
};

export default usePOCStudents; 