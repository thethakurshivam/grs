import { useState, useCallback, useEffect } from 'react';

interface Field {
  _id?: string;
  id?: string;
  name: string;
  count: number;
  link: string;
}

interface Course {
  _id: string;
  ID: string;
  mou_id: string;
  courseName: string;
  organization: string;
  duration: string;
  indoorCredits: number;
  outdoorCredits: number;
  field: {
    _id: string;
    name: string;
    count: number;
  };
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

interface FieldCoursesResponse {
  success: boolean;
  field: {
    _id: string;
    name: string;
    count: number;
  };
  coursesCount: number;
  courses: Course[];
}

interface UseSectorTrainingReturn {
  fields: Field[];
  selectedField: Field | null;
  fieldCourses: Course[];
  coursesCount: number;
  loading: boolean;
  error: string | null;
  fetchFields: () => Promise<void>;
  fetchFieldCourses: (fieldId: string) => Promise<void>;
  setSelectedField: (field: Field | null) => void;
}

export const useSectorTraining = (): UseSectorTrainingReturn => {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [fieldCourses, setFieldCourses] = useState<Course[]>([]);
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching fields for sector training...');

    try {
      const token = localStorage.getItem('authToken');
      console.log('Token from localStorage:', token ? 'Found' : 'Not found');
      
      if (!token) {
        console.error('No auth token found');
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Making request to /api/fields with token:', token.substring(0, 15) + '...');
      
      const response = await fetch('http://localhost:3000/api/fields', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Fields data received:', data);
      
      if (data.success) {
        console.log('Setting fields:', data.data);
        setFields(data.data || []);
      } else {
        console.error('API returned error:', data.error);
        setError(data.error || 'Failed to fetch fields');
      }
    } catch (err) {
      console.error('Error fetching fields:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch fields');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFieldCourses = useCallback(async (fieldId: string) => {
    setLoading(true);
    setError(null);
    console.log('useSectorTraining: Fetching courses for field:', fieldId);

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No auth token found');
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      console.log('useSectorTraining: Making request to /api/fields/' + fieldId);
      
      const response = await fetch(`http://localhost:3000/api/fields/${fieldId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      console.log('useSectorTraining: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('useSectorTraining: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: FieldCoursesResponse = await response.json();
      console.log('useSectorTraining: Field courses data received:', data);
      
      if (data.success) {
        setFieldCourses(data.courses || []);
        setCoursesCount(data.coursesCount || 0);
      } else {
        setError(data.error || 'Failed to fetch field courses');
      }
    } catch (err) {
      console.error('Error fetching field courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch field courses');
      setFieldCourses([]);
      setCoursesCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically fetch fields when the hook initializes
  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return {
    fields,
    selectedField,
    fieldCourses,
    coursesCount,
    loading,
    error,
    fetchFields,
    fetchFieldCourses,
    setSelectedField
  };
}; 