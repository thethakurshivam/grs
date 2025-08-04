import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, BookOpen, Building } from 'lucide-react';
import { useUpcomingCourses } from "@/hooks/useUpcomingCourses";

const UpcomingCoursesListPage = () => {
  const navigate = useNavigate();
  const { upcomingCourses, loading, error, fetchUpcomingCourses } = useUpcomingCourses();

  useEffect(() => {
    fetchUpcomingCourses();
  }, [fetchUpcomingCourses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading upcoming courses...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-8 w-8 text-orange-600" />
                Upcoming Courses
              </h1>
              <p className="text-muted-foreground mt-2">
                Total upcoming courses: {upcomingCourses.length}
              </p>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {upcomingCourses.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Upcoming Courses</h3>
              <p className="text-muted-foreground">
                There are no courses scheduled to start soon.
              </p>
            </div>
          ) : (
            upcomingCourses.map((course) => (
              <Card key={course._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-orange-600" />
                    {course.courseName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Organization:</strong>
                      </p>
                      <p className="text-foreground flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {course.organization}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Duration:</strong>
                      </p>
                      <p className="text-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Start Date:</strong>
                      </p>
                      <p className="text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(course.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Field:</strong>
                      </p>
                      <Badge variant="secondary" className="text-sm">
                        {course.field}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Indoor Credits:</strong>
                      </p>
                      <p className="text-foreground font-semibold">{course.indoorCredits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Outdoor Credits:</strong>
                      </p>
                      <p className="text-foreground font-semibold">{course.outdoorCredits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Status:</strong>
                      </p>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        {course.completionStatus}
                      </Badge>
                    </div>
                  </div>

                  {course.subjects && course.subjects.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Subjects:</strong>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.subjects.map((subject, index) => (
                          <div key={index} className="p-2 bg-muted rounded text-sm">
                            <p><strong>Periods:</strong> {subject.noOfPeriods}</p>
                            <p><strong>Duration:</strong> {subject.periodsMin} mins ({subject.totalHrs} hrs)</p>
                            <p><strong>Credits:</strong> {subject.credits}</p>
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
    </div>
  );
};

export default UpcomingCoursesListPage; 