import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, BookOpen, Clock, Award, GraduationCap } from 'lucide-react';
import { useStudentCompletedCourses } from '../hooks/useStudentCompletedCourses';

export const CompletedCoursesList: React.FC = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState<string>('');
  const { completedCourses, loading, error, completedCourseCount, fetchCompletedCourses } = useStudentCompletedCourses();

  useEffect(() => {
    const storedStudentId = localStorage.getItem('studentId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
      fetchCompletedCourses(storedStudentId);
    }
  }, [fetchCompletedCourses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading completed courses...</div>
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
              variant="default"
              size="sm"
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white border-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-green-600" />
                Completed Courses
              </h1>
              <p className="text-gray-700 mt-2">
                Total completed courses: {completedCourseCount}
              </p>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {completedCourseCount === 0 ? (
                          <div className="text-center py-12">
                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Completed Courses</h3>
                <p className="text-gray-600">
                  You haven't completed any courses yet. Start your learning journey!
                </p>
              </div>
          ) : (
            completedCourses.map((course) => (
              <Card key={course._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-green-600" />
                    {course.courseName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Organization:</strong>
                      </p>
                      <p className="text-gray-900">{course.organization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Field:</strong>
                      </p>
                      <p className="text-gray-900">{course.field}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Duration:</strong>
                      </p>
                      <p className="text-gray-900">{course.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Start Date:</strong>
                      </p>
                      <p className="text-gray-900">
                        {new Date(course.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {course.indoorCredits + course.outdoorCredits} Credits
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      Completed
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 