import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Calendar, Building, Target, Clock, GraduationCap } from "lucide-react";
import { useOngoingCoursesCount } from "@/hooks/useOngoingCoursesCount";
import { useNavigate } from "react-router-dom";

const OngoingCoursesListPage = () => {
  const { courses, loading, error, refetch } = useOngoingCoursesCount();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            <h1 className="text-2xl font-bold">Ongoing Courses</h1>
            <p className="text-muted-foreground">Loading ongoing courses data...</p>
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
            <h1 className="text-2xl font-bold">Ongoing Courses</h1>
            <p className="text-muted-foreground">Error loading ongoing courses data</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
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
          <h1 className="text-2xl font-bold">Ongoing Courses</h1>
          <p className="text-muted-foreground">
            {courses.length} ongoing course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Ongoing Courses List */}
      <div className="grid gap-4">
        {courses.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Ongoing Courses Found</h3>
              <p className="text-muted-foreground mb-4">
                No courses are currently ongoing.
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
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      {course.ID}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-foreground">
                      {course.courseName}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Organization:</span>
                    <span className="text-sm font-medium">{course.organization}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Field:</span>
                    <span className="text-sm font-medium">{course.field}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="text-sm font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Start Date:</span>
                    <span className="text-sm font-medium">{formatDate(course.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Indoor Credits:</span>
                    <span className="text-sm font-medium">{course.indoorCredits}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Outdoor Credits:</span>
                    <span className="text-sm font-medium">{course.outdoorCredits}</span>
                  </div>
                </div>
                
                {/* Subjects */}
                {course.subjects && course.subjects.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Subjects:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {course.subjects.map((subject, index) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded">
                          <div>Periods: {subject.noOfPeriods}</div>
                          <div>Duration: {subject.periodsMin} min</div>
                          <div>Credits: {subject.credits}</div>
                        </div>
                      ))}
                    </div>
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

export default OngoingCoursesListPage; 