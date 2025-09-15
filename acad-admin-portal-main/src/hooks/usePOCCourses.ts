import { useState, useEffect } from 'react';

interface POCCourse {
  _id: string;
  ID: string;
  courseName: string;
  organization: string;
  duration: string;
  indoorCredits: number;
  outdoorCredits: number;
  completionStatus: string;
  mou_id: string;
  field: string;
  startDate: string;
  subjects: Array<{
    noOfPeriods: number;
    periodsMin: number;
    totalMins: number;
    totalHrs: number;
    credits: number;
  }>;
}

interface POCData {
  _id: string;
  name: string;
  email: string;
  organization: string;
  mous: any[];
}

interface POCCoursesResponse {
  success: boolean;
  data: {
    poc: POCData;
    courses: POCCourse[];
  };
}

export const usePOCCourses = () => {
  const [courses, setCourses] = useState<POCCourse[]>([]);
  const [pocData, setPocData] = useState<POCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
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

      const response = await fetch(`http://localhost:3002/api/poc/${pocUserId}/courses`, {
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
          setError('Failed to fetch courses');
        }
        setLoading(false);
        return;
      }

      const data: POCCoursesResponse = await response.json();
      
      if (data.success) {
        setCourses(data.data.courses);
        setPocData(data.data.poc);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching POC courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    pocData,
    loading,
    error,
    refetch: fetchCourses,
  };
}; 