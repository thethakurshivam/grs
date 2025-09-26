import { useState, useCallback } from 'react';

interface EnrollmentResponse {
  success: boolean;
  message?: string;
  student?: any;
  error?: string;
}

interface UseStudentEnrollmentReturn {
  enrollInCourse: (studentId: string, courseId: string, onSuccess?: () => void) => Promise<EnrollmentResponse>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useStudentEnrollment = (): UseStudentEnrollmentReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const enrollInCourse = useCallback(async (studentId: string, courseId: string, onSuccess?: () => void): Promise<EnrollmentResponse> => {
    if (!studentId || !courseId) {
      const errorMsg = 'Student ID and Course ID are required';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('studentToken');
      
      if (!token) {
        const errorMsg = 'Authentication token not found';
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }

      const response = await fetch(`http://localhost:3000/student/${studentId}/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data: EnrollmentResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setSuccess(true);
        setError(null);
        
        // Call the onSuccess callback if provided (for refetching data)
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
      } else {
        setError(data.error || 'Enrollment failed');
        setSuccess(false);
      }

      setLoading(false);
      return data;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to enroll in course';
      console.error('Error enrolling in course:', err);
      setError(errorMsg);
      setSuccess(false);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    enrollInCourse,
    loading,
    error,
    success
  };
};
