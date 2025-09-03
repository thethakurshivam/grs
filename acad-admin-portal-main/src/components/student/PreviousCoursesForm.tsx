import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Plus, Trash2, Upload, Info } from 'lucide-react';
import useBPRNDUmbrellas from '@/hooks/useBPRNDUmbrellas';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { useCenteredToastContext } from '@/contexts/centered-toast-context';
import { StudentDashboardLayout } from './StudentDashboardLayout';

interface PreviousCourse {
  organization_name: string;
  course_name: string;
  certificate_pdf: File | null;
}

const PreviousCoursesForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showSuccess } = useCenteredToastContext();
  const [previousCourses, setPreviousCourses] = useState<PreviousCourse[]>([
    { organization_name: '', course_name: '', certificate_pdf: null }
  ]);
  const [applicantName, setApplicantName] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [theoryHours, setTheoryHours] = useState<string>('');
  const [practicalHours, setPracticalHours] = useState<string>('');
  const [totalHours, setTotalHours] = useState<string>('');
  const [calculatedCredits, setCalculatedCredits] = useState<string>('');
  const [noOfDays, setNoOfDays] = useState<string>('');
  const { umbrellas, isLoading: umbrellasLoading, error: umbrellasError } = useBPRNDUmbrellas();
  
  // Auto-calculate total hours and credits when theory or practical hours change
  useEffect(() => {
    const theory = Number(theoryHours) || 0;
    const practical = Number(practicalHours) || 0;
    
    // Calculate total hours
    const total = theory + practical;
    setTotalHours(total.toString());
    
    // Calculate credits: theory (15 hours = 1 credit) + practical (30 hours = 1 credit)
    const credits = (theory / 15) + (practical / 30);
    setCalculatedCredits(credits.toFixed(2));
  }, [theoryHours, practicalHours]);
  
  // Debug logging for troubleshooting
  console.log('🔍 PreviousCoursesForm Debug:', {
    umbrellas,
    umbrellasLoading,
    umbrellasError,
    umbrellasCount: umbrellas?.length || 0
  });
  
  // Resolve BPRND student ID from localStorage
  const storedBprnd = typeof window !== 'undefined' ? localStorage.getItem('bprndStudentData') : null;
  let derivedStudentId: string | null = null;
  try {
    if (storedBprnd) {
      const parsed = JSON.parse(storedBprnd);
      derivedStudentId = parsed?._id || null;
    }
  } catch (_) {}
  const studentId = derivedStudentId || (typeof window !== 'undefined' ? (localStorage.getItem('bprndStudentId') || localStorage.getItem('studentId')) : null);

  // Auto-fill student name from localStorage when component mounts
  useEffect(() => {
    const storedName = localStorage.getItem('studentName');
    
    if (storedName && !applicantName) {
      setApplicantName(storedName);
      console.log('✅ Auto-filled student name from localStorage:', storedName);
    }
  }, [applicantName]);

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
      showSuccess('File Selected', file.name, 5000); // 5 seconds centered popup
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate
      if (!applicantName.trim()) {
        toast({ title: 'Validation Error', description: 'Please enter your name', variant: 'destructive' });
        return;
      }
      if (!studentId) {
        toast({ title: 'Validation Error', description: 'Missing student ID. Please log in again.', variant: 'destructive' });
        return;
      }
      const first = previousCourses[0];
      if (!first.organization_name.trim()) {
        toast({ title: 'Validation Error', description: 'Please enter organization name', variant: 'destructive' });
        return;
      }
      if (!first.course_name.trim()) {
        toast({ title: 'Validation Error', description: 'Please enter course name', variant: 'destructive' });
        return;
      }
      if (!first.certificate_pdf) {
        toast({ title: 'Validation Error', description: 'Please attach certificate PDF', variant: 'destructive' });
        return;
      }
      if (!theoryHours.trim() || Number(theoryHours) <= 0) {
        toast({ title: 'Validation Error', description: 'Please enter valid theory hours', variant: 'destructive' });
        return;
      }
      if (!practicalHours.trim() || Number(practicalHours) <= 0) {
        toast({ title: 'Validation Error', description: 'Please enter valid practical hours', variant: 'destructive' });
        return;
      }

      // Compose form-data for api4 /pending-credits
      const formData = new FormData();
      formData.append('studentId', studentId);
      formData.append('name', applicantName.trim());
      formData.append('courseName', first.course_name.trim());
      formData.append('organization', first.organization_name.trim());
      formData.append('discipline', discipline.trim());
      formData.append('theoryHours', String(Number(theoryHours)));
      formData.append('practicalHours', String(Number(practicalHours)));
      formData.append('noOfDays', String(Number(noOfDays)));
      formData.append('pdf', first.certificate_pdf);

      const response = await fetch('http://localhost:3004/pending-credits', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Request failed with status ${response.status}`);
      }

      // Show centered success toast for "POC and Admin pending" message
      showSuccess(
        'Course Submitted Successfully!', 
        'Your course has been submitted and is pending POC and Admin approval. You will be notified once approved.',
        10000 // 10 seconds
      );
      
      // Automatically redirect to BPRND student dashboard after 10 seconds
      setTimeout(() => {
        navigate('/student/bprnd/dashboard');
      }, 10000); // 10 seconds delay to match the popup duration
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error. Please try again.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 bg-gray-100 rounded-lg border border-gray-300 p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/student/dashboard')}
            className="hover:bg-gray-200 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Add Course Other Than RRU</h1>
            <p className="text-gray-600 mt-2">Submit a course certificate (PDF) for pending credits.</p>
          </div>
        </div>

        {/* Form */}
        <Card className="border border-gray-300 bg-gray-100">
          <CardHeader className="border-b border-gray-200 px-8 py-6">
            <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gray-200 rounded-lg">
                <Upload className="h-6 w-6 text-gray-600" />
              </div>
              Pending Credits Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Applicant name */}
            <div className="space-y-3">
              <Label htmlFor="applicant-name" className="text-gray-700 font-medium text-sm">
                Your Name *
                {localStorage.getItem('studentName') && (
                  <span className="ml-2 text-xs text-green-600 font-normal">(Auto-filled from profile)</span>
                )}
              </Label>
              <Input
                id="applicant-name"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="e.g., John Doe"
                className="border-gray-300 focus:border-gray-400 focus:ring-gray-400 h-12 text-base text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {/* Discipline */}
            <div className="space-y-3">
              <Label htmlFor="discipline" className="text-gray-700 font-medium text-sm">
                Discipline *
              </Label>
              <select
                id="discipline"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full border-gray-300 focus:border-gray-400 focus:ring-gray-400 h-12 text-base rounded-md text-gray-900"
              >
                <option value="" disabled>{umbrellasLoading ? 'Loading...' : 'Select a discipline'}</option>
                {(umbrellas || []).filter((u) => u.name !== 'Cyber Security').map((u) => {
                  // Define umbrella categories mapping
                  const umbrellaCategories = {
                    'Police Administration': [
                      'Tourism Police',
                      'Women in Security and Police',
                      'Traffic Management and Road Safety',
                      'Border Management',
                      'Disaster Risk Reduction'
                    ],
                    'Cyber Security': [
                      'Cyber Law',
                      'Cyber Threat Intelligence',
                      'OSI Model',
                      'Social Media Security'
                    ],
                    'Forensics': [
                      'Behavioral Sciences',
                      'Forensics Psychology',
                      'Gender Sensitisation'
                    ]
                  };

                  // Find which category this umbrella belongs to
                  let category = '';
                  Object.entries(umbrellaCategories).forEach(([cat, umbrellas]) => {
                    if (umbrellas.includes(u.name)) {
                      category = cat;
                    }
                  });

                  // Add prefix if category is found
                  const displayName = category ? `[${category}] - ${u.name}` : u.name;
                  
                  return (
                    <option key={u._id} value={u.name}>{displayName}</option>
                  );
                })}
              </select>
              {umbrellasError && (
                <p className="text-sm text-red-600">Failed to load disciplines: {umbrellasError}</p>
              )}
              {!umbrellasLoading && !umbrellasError && (!umbrellas || umbrellas.length === 0) && (
                <p className="text-sm text-yellow-600">No disciplines available. Please refresh the page or contact support.</p>
              )}
              {!umbrellasLoading && umbrellas && umbrellas.length > 0 && (
                <p className="text-sm text-green-600">✓ {umbrellas.length} disciplines loaded successfully</p>
              )}
            </div>

            {previousCourses.map((course, index) => (
              <Card key={index} className="border border-gray-300 bg-gray-200">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Course {index + 1}</h3>
                    {previousCourses.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCourse(index)}
                        className="border-gray-400 text-gray-600 hover:bg-gray-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor={`org-${index}`} className="text-gray-700 font-medium text-sm">
                        Organization *
                      </Label>
                      <Input
                        id={`org-${index}`}
                        value={course.organization_name}
                        onChange={(e) => updateCourse(index, 'organization_name', e.target.value)}
                        placeholder="e.g., Coursera, edX, ..."
                        className="border-gray-300 focus:border-gray-400 focus:ring-gray-400 h-12 text-base text-gray-900 placeholder:text-gray-500"
                      />
                    </div>

                  <div className="space-y-3">
                      <Label htmlFor={`course-${index}`} className="text-gray-700 font-medium text-sm">
                        Course Name
                      </Label>
                      <Input
                        id={`course-${index}`}
                        value={course.course_name}
                        onChange={(e) => updateCourse(index, 'course_name', e.target.value)}
                        placeholder="e.g., Machine Learning, Web Development..."
                        className="border-gray-300 focus:border-gray-400 focus:ring-gray-400 h-12 text-base text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Hours and Credits */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="theory-hours" className="text-gray-700 font-medium text-sm">
                        Theory Hours *
                      </Label>
                      <Input
                        id="theory-hours"
                        type="number"
                        min={0}
                        value={theoryHours}
                        onChange={(e) => setTheoryHours(e.target.value)}
                        placeholder="e.g., 20"
                        className="border-gray-300 focus:border-gray-400 focus:ring-gray-400 h-12 text-base text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="practical-hours" className="text-gray-700 font-medium text-sm">
                        Practical Hours *
                      </Label>
                      <Input
                        id="practical-hours"
                        type="number"
                        min={0}
                        value={practicalHours}
                        onChange={(e) => setPracticalHours(e.target.value)}
                        placeholder="e.g., 30"
                        className="border-gray-300 focus:border-gray-400 focus:ring-gray-400 h-12 text-base text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="total-hours" className="text-gray-700 font-medium text-sm">
                        Total Hours
                      </Label>
                      <Input
                        id="total-hours"
                        type="number"
                        min={0}
                        value={totalHours}
                        readOnly
                        className="border-gray-300 bg-gray-100 h-12 text-base text-gray-900 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="calculated-credits" className="text-gray-700 font-medium text-sm">
                        Calculated Credits
                      </Label>
                      <Input
                        id="calculated-credits"
                        type="text"
                        value={calculatedCredits}
                        readOnly
                        className="border-gray-300 bg-gray-100 h-12 text-base text-gray-900 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Number of Days */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="no-of-days" className="text-gray-700 font-medium text-sm">
                        Number of Days *
                      </Label>
                      <Input
                        id="no-of-days"
                        type="number"
                        min={0}
                        value={noOfDays}
                        onChange={(e) => setNoOfDays(e.target.value)}
                        placeholder="e.g., 5"
                        className="border-gray-300 focus:border-gray-400 focus:ring-gray-400 h-12 text-base text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Credit Calculation Info */}
                  <div className="bg-gray-300 border border-gray-400 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-gray-400 rounded">
                        <Info className="h-4 w-4 text-gray-700" />
                      </div>
                      <div className="text-sm text-gray-800">
                        <p className="font-medium mb-1">Credit Calculation Formula:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• <strong>Theory Hours:</strong> 15 hours = 1 credit</li>
                          <li>• <strong>Practical Hours:</strong> 30 hours = 1 credit</li>
                          <li>• <strong>Total Credits:</strong> (Theory ÷ 15) + (Practical ÷ 30)</li>
                        </ul>
                        <p className="text-xs mt-2 text-gray-700">
                          Example: 30 theory + 60 practical = (30÷15) + (60÷30) = 2 + 2 = 4 credits
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor={`cert-${index}`} className="text-gray-700 font-medium text-sm">
                      Certificate PDF *
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          id={`cert-${index}`}
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(index, e)}
                          className="border-gray-300 focus:border-gray-400 focus:ring-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Upload your course completion certificate (PDF format only)</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={addCourse}
                className="w-full border-2 border-dashed border-gray-400 text-gray-700 hover:bg-gray-300 hover:border-gray-500 h-16 text-base font-medium"
              >
                <Plus className="h-5 w-5 mr-3" />
                Add Another Course
              </Button>
            </div>

            <div className="flex gap-6 pt-8 border-t border-gray-300">
              <Button
                variant="outline"
                onClick={() => navigate('/student/dashboard')}
                className="flex-1 h-12 text-base font-medium border-gray-400 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-12 text-base font-medium bg-gray-800 hover:bg-gray-900 text-white transition-colors"
              >
                Submit
              </Button>
            </div>
                  </CardContent>
      </Card>
      </div>
    </StudentDashboardLayout>
  );
};

export default PreviousCoursesForm; 