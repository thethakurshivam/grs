import { useState, useCallback } from 'react';

interface StudentProfile {
  id: string;
  sr_no: number | null;
  batch_no: string;
  rank: string;
  serial_number: string;
  enrollment_number: string;
  full_name: string;
  gender: string;
  dob: string | null;
  birth_place: string;
  birth_state: string;
  country: string;
  aadhar_no: string;
  mobile_no: string;
  alternate_number: string;
  email: string;
  address: string;
  mou_id: string;
  credits: number;
  available_credit: number;
  used_credit: number;
  course_id: string[];
  previous_courses_certification: Array<{
    organization_name: string;
    course_name: string;
    certificate_pdf: string;
  }>;
}

interface UseStudentProfileReturn {
  studentProfile: StudentProfile | null;
  loading: boolean;
  error: string | null;
  fetchStudentProfile: (studentId: string) => Promise<void>;
}

export const useStudentProfile = (): UseStudentProfileReturn => {
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
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
      const token = localStorage.getItem('studentToken');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/students/${studentId}`, {
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
        setStudentProfile(data.student);
      } else {
        setError(data.error || 'Failed to fetch student profile');
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch student profile');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    studentProfile,
    loading,
    error,
    fetchStudentProfile
  };
}; 