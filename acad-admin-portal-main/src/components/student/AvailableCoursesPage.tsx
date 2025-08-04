import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BookOpen, Clock, Award, Building, Calendar } from 'lucide-react';
import { useStudentCourses } from '../../hooks/useStudentCourses';

export const AvailableCoursesPage: React.FC = () => {
  const [studentId, setStudentId] = useState<string>('');
  const { courses, loading, error, fetchCourses } = useStudentCourses();

  useEffect(() => {
    const storedStudentId = localStorage.getItem('studentId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchCourses(studentId);
    }
  }, [studentId, fetchCourses]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-gray-700 mt-2">Browse and enroll in available courses.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading courses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-gray-700 mt-2">Browse and enroll in available courses.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-900 font-semibold mb-2">Error loading courses:</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
        <p className="text-gray-700 mt-2">Browse and enroll in available courses.</p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Available Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available</h3>
              <p className="text-gray-600">
                No courses are currently available for enrollment.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  {course.courseName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-700 mb-1 font-semibold">
                      Organization:
                    </p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      {course.organization}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-1 font-semibold">
                      Field:
                    </p>
                    <p className="text-gray-900">{course.field}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-1 font-semibold">
                      Duration:
                    </p>
                    <p className="text-gray-900 flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {course.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-1 font-semibold">
                      Start Date:
                    </p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(course.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200">
                    <Award className="h-3 w-3" />
                    <span className="font-semibold">{course.indoorCredits + course.outdoorCredits} Credits</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 border-gray-300 text-gray-800 bg-gray-50">
                    <Clock className="h-3 w-3" />
                    <span className="font-semibold">{course.duration}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}; 