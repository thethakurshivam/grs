import { useState, useCallback } from 'react';

interface BPRNDStudent {
  _id: string;
  email: string;
  Name: string;
  Designation?: string;
  State?: string;
  Umbrella?: string;
  Department?: string;
  EmployeeId?: string;
  Phone?: string;
  JoiningDate?: string;
  // Add other fields from credit_calculations schema as needed
  [key: string]: any;
}

interface UseBPRNDStudentProfileReturn {
  student: BPRNDStudent | null;
  loading: boolean;
  error: string | null;
  fetchStudentProfile: (studentId: string) => Promise<void>;
  clearError: () => void;
}

export const useBPRNDStudentProfile = (): UseBPRNDStudentProfileReturn => {
  const [student, setStudent] = useState<BPRNDStudent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentProfile = useCallback(async (studentId: string) => {
    if (!studentId) {
      setError('Student ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching BPRND student profile for ID:', studentId);
      console.log('API URL:', `/api/student/${studentId}`);

      const response = await fetch(`/api/student/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        setStudent(data.student);
        console.log('BPRND student profile loaded:', {
          id: data.student._id,
          name: data.student.Name,
          email: data.student.email,
          designation: data.student.Designation,
          state: data.student.State,
          umbrella: data.student.Umbrella
        });
      } else {
        const errorMessage = data.message || 'Failed to fetch student profile';
        setError(errorMessage);
        console.error('BPRND profile fetch error:', errorMessage);
        console.error('Response not OK:', response.status, response.statusText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      setError(errorMessage);
      console.error('BPRND profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    student,
    loading,
    error,
    fetchStudentProfile,
    clearError,
  };
};
