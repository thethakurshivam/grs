import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Calendar, Building, Target, Clock, GraduationCap, FileText, Hash, Award, School } from "lucide-react";
import { useCompletedCourses } from "@/hooks/useCompletedCourses";
import { useMOU } from "@/hooks/useMOU";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const CompletedCoursesListPage = () => {
  const { courses, loading, error, refetch } = useCompletedCourses();
  const { fetchMOUById } = useMOU();
  const navigate = useNavigate();
  const [mouDetails, setMouDetails] = useState<{[key: string]: any}>({});

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
      
      for (const course of courses) {
        if (course.mou_id && !mouDetails[course.mou_id]) {
          const mou = await fetchMOUById(course.mou_id);
          if (mou) {
            details[course.mou_id] = mou;
          }
        }
      }
      
      setMouDetails(prev => ({ ...prev, ...details }));
    };

    if (courses.length > 0) {
      fetchMOUDetails();
    }
  }, [courses, fetchMOUById]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black">Completed Courses</h1>
            <p className="text-black">Loading completed courses data...</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black">Completed Courses</h1>
            <p className="text-black">Error loading completed courses data</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-black mb-4">{error}</p>
            <Button onClick={refetch}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-black">Completed Courses</h1>
          <p className="text-black">
            {courses.length} completed course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Courses List */}
      <div className="grid gap-4">
        {courses.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-black">No Completed Courses Found</h3>
              <p className="text-black mb-4">
                No completed courses have been found in the system.
              </p>
              <Button onClick={() => navigate('/dashboard/add-course')}>
                Add First Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2 text-black">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      {course.courseName}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-black">
                      {course.organization}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Target className="h-3 w-3" />
                    {course.completionStatus}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Course ID:</span>
                    <span className="text-sm font-medium text-black">{course.ID}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Field:</span>
                    <span className="text-sm font-medium text-black">{course.field}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Start Date:</span>
                    <span className="text-sm font-medium text-black">{formatDate(course.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">End Date:</span>
                    <span className="text-sm font-medium text-black">{formatDate(course.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Duration:</span>
                    <span className="text-sm font-medium text-black">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Indoor Credits:</span>
                    <span className="text-sm font-medium text-black">{course.indoorCredits}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Outdoor Credits:</span>
                    <span className="text-sm font-medium text-black">{course.outdoorCredits}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">MOU ID:</span>
                    <span className="text-sm font-medium text-black">{course.mou_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">MOU Name:</span>
                    <span className="text-sm font-medium text-black">{mouDetails?.ID || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">MOU School:</span>
                    <span className="text-sm font-medium text-black">{mouDetails?.school || 'Loading...'}</span>
                  </div>
                </div>
                {course.description && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-black">{course.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CompletedCoursesListPage; 