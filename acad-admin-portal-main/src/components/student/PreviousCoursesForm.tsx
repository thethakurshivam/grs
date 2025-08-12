import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

interface PreviousCourse {
  organization_name: string;
  course_name: string;
  certificate_pdf: File | null;
}

const PreviousCoursesForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [previousCourses, setPreviousCourses] = useState<PreviousCourse[]>([
    { organization_name: '', course_name: '', certificate_pdf: null }
  ]);
  const [applicantName, setApplicantName] = useState('');

  const addCourse = () => {
    setPreviousCourses([...previousCourses, { organization_name: '', course_name: '', certificate_pdf: null }]);
  };

  const removeCourse = (index: number) => {
    if (previousCourses.length > 1) {
      const updatedCourses = previousCourses.filter((_, i) => i !== index);
      setPreviousCourses(updatedCourses);
    }
  };

  const updateCourse = (index: number, field: keyof PreviousCourse, value: any) => {
    const updatedCourses = [...previousCourses];
    updatedCourses[index] = { ...updatedCourses[index], [field]: value };
    setPreviousCourses(updatedCourses);
  };

  const handleFileUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    updateCourse(index, 'certificate_pdf', file);
    if (file) {
      toast({ title: 'File selected', description: file.name });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate
      if (!applicantName.trim()) {
        toast({ title: 'Validation Error', description: 'Please enter your name', variant: 'destructive' });
        return;
      }
      const first = previousCourses[0];
      if (!first.organization_name.trim()) {
        toast({ title: 'Validation Error', description: 'Please enter organization name', variant: 'destructive' });
        return;
      }
      if (!first.certificate_pdf) {
        toast({ title: 'Validation Error', description: 'Please attach certificate PDF', variant: 'destructive' });
        return;
      }

      // Compose form-data for api4 /pending-credits
      const formData = new FormData();
      formData.append('name', applicantName.trim());
      formData.append('organization', first.organization_name.trim());
      formData.append('pdf', first.certificate_pdf);

      const response = await fetch('http://localhost:3004/pending-credits', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Request failed with status ${response.status}`);
      }

      toast({ title: 'Submitted', description: data?.message || 'Pending credit record created successfully' });
      // Do not redirect to the normal student portal – stay on this page
      // If you prefer to go to BPRND dashboard instead, uncomment the next line:
      // navigate('/student/bprnd/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error. Please try again.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
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
            <h1 className="text-3xl font-bold text-gray-900">Add Course Other Than RRU</h1>
            <p className="text-gray-600 mt-2">Submit a course certificate (PDF) for pending credits.</p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-200 px-8 py-6">
            <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Upload className="h-6 w-6 text-indigo-600" />
              </div>
              Pending Credits Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Applicant name */}
            <div className="space-y-3">
              <Label htmlFor="applicant-name" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                Your Name *
              </Label>
              <Input
                id="applicant-name"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="e.g., John Doe"
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base"
              />
            </div>

            {previousCourses.map((course, index) => (
              <Card key={index} className="border border-gray-200 bg-gray-50 shadow-sm">
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor={`org-${index}`} className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                        Organization *
                      </Label>
                      <Input
                        id={`org-${index}`}
                        value={course.organization_name}
                        onChange={(e) => updateCourse(index, 'organization_name', e.target.value)}
                        placeholder="e.g., Coursera, edX, ..."
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor={`course-${index}`} className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                        Course Name
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
                      Certificate PDF *
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
                    </div>
                    <p className="text-xs text-gray-500">Upload your course completion certificate (PDF format only)</p>
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
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviousCoursesForm; 