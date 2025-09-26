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

interface POCCoursesResponse {
  success: boolean;
  data: {
    courses: POCCourse[];
  };
}

const usePOCCoursesForDropdown = () => {
  const [courses, setCourses] = useState<POCCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const pocToken = localStorage.getItem('pocToken');
        const pocUserId = localStorage.getItem('pocUserId');

        if (!pocToken || !pocUserId) {
          setError('Authentication required');
          return;
        }

        const response = await fetch(`http://localhost:3000/poc/${pocUserId}/courses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pocToken}`,
          },
        });

        if (response.status === 401) {
          setError('Authentication failed');
          return;
        }

        if (response.status === 403) {
          setError('Access denied. You can only access your own data.');
          return;
        }

        if (response.status === 404) {
          setError('POC not found');
          return;
        }

        if (!response.ok) {
          setError('Failed to fetch courses');
          return;
        }

        const data: POCCoursesResponse = await response.json();
        
        if (data.success) {
          setCourses(data.data.courses);
        } else {
          setError('Failed to fetch courses');
        }
      } catch (err) {
        console.error('Error fetching POC courses:', err);
        setError('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const refetch = () => {
    setLoading(true);
    setError(null);
    // Trigger useEffect to refetch
    const pocUserId = localStorage.getItem('pocUserId');
    if (pocUserId) {
      // Force re-render by updating a dependency
      setCourses([]);
    }
  };

  return {
    courses,
    loading,
    error,
    refetch,
  };
};

export default usePOCCoursesForDropdown; 