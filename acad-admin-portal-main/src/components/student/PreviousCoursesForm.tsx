import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

interface PreviousCourse {
  organization_name: string;
  course_name: string;
  certificate_pdf: string;
}

const PreviousCoursesForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [previousCourses, setPreviousCourses] = useState<PreviousCourse[]>([
    { organization_name: '', course_name: '', certificate_pdf: '' }
  ]);

  const addCourse = () => {
    setPreviousCourses([...previousCourses, { organization_name: '', course_name: '', certificate_pdf: '' }]);
  };

  const removeCourse = (index: number) => {
    if (previousCourses.length > 1) {
      const updatedCourses = previousCourses.filter((_, i) => i !== index);
      setPreviousCourses(updatedCourses);
    }
  };

  const updateCourse = (index: number, field: keyof PreviousCourse, value: string) => {
    const updatedCourses = [...previousCourses];
    updatedCourses[index] = { ...updatedCourses[index], [field]: value };
    setPreviousCourses(updatedCourses);
  };

  const handleFileUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server
      // For now, we'll just store the file name
      updateCourse(index, 'certificate_pdf', file.name);
      toast({
        title: "File uploaded",
        description: `${file.name} has been selected`,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate that all required fields are filled
      const isValid = previousCourses.every(course => 
        course.organization_name.trim() && course.course_name.trim()
      );

      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Get authentication token
      const token = localStorage.getItem('studentToken');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again to continue",
          variant: "destructive",
        });
        return;
      }

      // API call to save previous courses
      const response = await fetch('http://localhost:3000/api/students/previous-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ previous_courses_certification: previousCourses }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Previous courses have been saved successfully",
        });
        navigate('/student/dashboard');
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save previous courses",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving previous courses:', error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 bg-white rounded-lg shadow-sm p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/student/dashboard')}
            className="hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Previous Courses</h1>
            <p className="text-gray-600 mt-2">Add your completed courses from other institutions</p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 px-8 py-6">
            <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Upload className="h-6 w-6 text-indigo-600" />
              </div>
              Previous Course Certifications
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Please provide details about courses you have completed at other institutions. 
              This information will help us evaluate your academic background.
            </p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {previousCourses.map((course, index) => (
              <Card key={index} className="border border-gray-200 bg-gray-50 shadow-sm">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Course {index + 1}
                      </h3>
                    </div>
                    {previousCourses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCourse(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full p-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor={`org-${index}`} className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                        Organization Name *
                      </Label>
                      <Input
                        id={`org-${index}`}
                        value={course.organization_name}
                        onChange={(e) => updateCourse(index, 'organization_name', e.target.value)}
                        placeholder="e.g., Coursera, edX, University of..."
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor={`course-${index}`} className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                        Course Name *
                      </Label>
                      <Input
                        id={`course-${index}`}
                        value={course.course_name}
                        onChange={(e) => updateCourse(index, 'course_name', e.target.value)}
                        placeholder="e.g., Machine Learning, Web Development..."
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor={`cert-${index}`} className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                      Certificate PDF
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          id={`cert-${index}`}
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(index, e)}
                          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                      {course.certificate_pdf && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-700 font-medium">
                            {course.certificate_pdf}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload your course completion certificate (PDF format only)
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={addCourse}
                className="w-full border-2 border-dashed border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 h-16 text-base font-medium"
              >
                <Plus className="h-5 w-5 mr-3" />
                Add Another Course
              </Button>
            </div>

            <div className="flex gap-6 pt-8 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => navigate('/student/dashboard')}
                className="flex-1 h-12 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-12 text-base font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Save Previous Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviousCoursesForm; 