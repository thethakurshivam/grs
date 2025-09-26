import { useState, useEffect } from 'react';

interface Course {
  _id: string;
  ID: string;
  mou_id: string;
  courseName: string;
  organization: string;
  duration: string;
  indoorCredits: number;
  outdoorCredits: number;
  field: string;
  startDate: string;
  completionStatus: string;
  subjects: Array<{
    noOfPeriods: number;
    periodsMin: number;
    totalMins: number;
    totalHrs: number;
    credits: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Field {
  _id: string;
  nameOfTheField: string;
  count: number;
}

interface FieldCoursesResponse {
  success: boolean;
  field: Field;
  coursesCount: number;
  courses: Course[];
}

export const useFieldCourses = (fieldId: string | null) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [field, setField] = useState<Field | null>(null);
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFieldCourses = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      console.log('Token found:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Making API request to:', `http://localhost:3000/admin/fields/${id}`);
      
      const response = await fetch(`http://localhost:3000/admin/fields/${id}`, {
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

      const data: FieldCoursesResponse = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setCourses(data.courses);
        setField(data.field);
        setCoursesCount(data.coursesCount);
        console.log('Successfully fetched', data.coursesCount, 'courses for field');
      } else {
        throw new Error(data.error || 'Failed to fetch field courses');
      }
    } catch (err) {
      console.error('Error in fetchFieldCourses:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCourses([]);
      setField(null);
      setCoursesCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fieldId) {
      fetchFieldCourses(fieldId);
    }
  }, [fieldId]);

  return {
    courses,
    field,
    coursesCount,
    loading,
    error,
    refetch: () => fieldId ? fetchFieldCourses(fieldId) : null
  };
}; 