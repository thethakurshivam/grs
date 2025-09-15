import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowLeft, BookOpen, Calendar, Building, Clock, Hash, GraduationCap } from "lucide-react";
import { useSectorTraining } from "@/hooks/useSectorTraining";

const FieldCourses = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const navigate = useNavigate();
  const { 
    fieldCourses, 
    coursesCount, 
    loading, 
    error, 
    fetchFieldCourses 
  } = useSectorTraining();

  useEffect(() => {
    if (fieldId) {
      fetchFieldCourses(fieldId);
    }
  }, [fieldId, fetchFieldCourses]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/sector-training')}
              className="mb-4 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fields
            </Button>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Field Courses</h1>
                  <p className="text-gray-600 mt-1">Loading courses...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/sector-training')}
              className="mb-4 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fields
            </Button>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <BookOpen className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Field Courses</h1>
                  <p className="text-red-600 mt-1">Error: {error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/sector-training')}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fields
          </Button>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Field Courses</h1>
                <p className="text-gray-600 mt-1">
                  {coursesCount} courses available in this field
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {fieldCourses.length === 0 ? (
            <Card className="bg-white shadow-md">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
                <p className="text-gray-600">No courses are currently available for this field.</p>
              </CardContent>
            </Card>
          ) : (
            fieldCourses.map((course) => (
              <Card key={course._id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Course Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{course.courseName}</h3>
                        <p className="text-sm text-gray-600">ID: {course.ID}</p>
                      </div>
                      <Badge className={getStatusColor(course.completionStatus)}>
                        {course.completionStatus}
                      </Badge>
                    </div>

                    {/* Course Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Organization:</span>
                        <span className="text-sm text-gray-700">{course.organization}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Duration:</span>
                        <span className="text-sm text-gray-700">{course.duration}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Start Date:</span>
                        <span className="text-sm text-gray-700">{formatDate(course.startDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Indoor Credits:</span>
                        <span className="text-sm text-gray-700">{course.indoorCredits}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Outdoor Credits:</span>
                        <span className="text-sm text-gray-700">{course.outdoorCredits}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Field:</span>
                        <span className="text-sm text-gray-700">{course.field?.name || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Subjects */}
                    {course.subjects && course.subjects.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-3 text-gray-900 flex items-center gap-2">
                          <Hash className="h-4 w-4 text-blue-600" />
                          Subjects ({course.subjects.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {course.subjects.map((subject, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-xs font-medium text-gray-900 mb-1">
                                Subject {index + 1}
                              </div>
                              <div className="space-y-1 text-xs text-gray-700">
                                <div>Periods: {subject.noOfPeriods} × {subject.periodsMin}min</div>
                                <div>Total: {subject.totalHrs}hrs ({subject.totalMins}min)</div>
                                <div>Credits: {subject.credits}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Course Metadata */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created: {formatDate(course.createdAt)}</span>
                        <span>Updated: {formatDate(course.updatedAt)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Course ID: {course._id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {fieldCourses.length > 0 && (
          <div className="mt-8">
            <Card className="bg-white shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Course Summary</h3>
                    <p className="text-gray-600">Total courses in this field</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{coursesCount}</div>
                    <div className="text-sm text-gray-600">Courses</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldCourses; 