import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Building, Target, Clock, GraduationCap, FileText, Hash, Award, School } from "lucide-react";
import { useUpcomingCourses } from "@/hooks/useUpcomingCourses";
import { useMOU } from "@/hooks/useMOU";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const UpcomingCoursesListPage = () => {
  const { upcomingCourses, loading, error, fetchUpcomingCourses } = useUpcomingCourses();
  const { fetchMOUById } = useMOU();
  const navigate = useNavigate();
  const [mouDetails, setMouDetails] = useState<{[key: string]: any}>({});

  // Fetch upcoming courses on component mount
  useEffect(() => {
    fetchUpcomingCourses();
  }, [fetchUpcomingCourses]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch MOU details for all courses
  useEffect(() => {
    const fetchMOUDetails = async () => {
      const details: {[key: string]: any} = {};
      
      for (const course of upcomingCourses) {
        if (course.mou_id && !mouDetails[course.mou_id]) {
          const mou = await fetchMOUById(course.mou_id);
          if (mou) {
            details[course.mou_id] = mou;
          }
        }
      }
      
      setMouDetails(prev => ({ ...prev, ...details }));
    };

    if (upcomingCourses.length > 0) {
      fetchMOUDetails();
    }
  }, [upcomingCourses, fetchMOUById]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Courses</h1>
          <p className="text-gray-700 mt-2">Courses scheduled to start soon</p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading upcoming courses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Courses</h1>
          <p className="text-gray-700 mt-2">Courses scheduled to start soon</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-900 font-semibold mb-2">Error loading upcoming courses:</h3>
          <p className="text-red-700 text-sm">{error}</p>
          <Button 
            onClick={fetchUpcomingCourses} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Courses</h1>
        <p className="text-gray-700 mt-2">Courses scheduled to start soon</p>
      </div>

      {upcomingCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Courses</h3>
            <p className="text-gray-600 text-center">
              There are no courses scheduled to start soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {upcomingCourses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                      {course.courseName}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {course.description || 'No description available'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      Upcoming
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {course.organization}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {course.field}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Starts: {formatDate(course.startDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Duration: {course.duration}
                    </span>
                  </div>
                </div>
                
                {course.mou_id && mouDetails[course.mou_id] && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <School className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">MOU Partner</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {mouDetails[course.mou_id].nameOfPartnerInstitution}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    <span>Credits: {course.indoorCredits + course.outdoorCredits}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>Level: {course.level || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Type: {course.courseType || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingCoursesListPage; 