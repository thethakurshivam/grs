import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, FileText, Users, ChevronDown } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePOCMOUs } from '@/hooks/usePOCMOUs';
import usePOCCoursesForDropdown from '@/hooks/usePOCCoursesForDropdown';
import useBPRNDUmbrellas from '@/hooks/useBPRNDUmbrellas';

interface POCBulkImportStudentsPageProps {
  type?: 'bprnd';
}

const POCBulkImportStudentsPage: React.FC<POCBulkImportStudentsPageProps> = ({
  type,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMOU, setSelectedMOU] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [umbrella, setUmbrella] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const { toast } = useToast();

  // Conditional hooks based on type
  const { mous, loading: mousLoading, error: mousError } = usePOCMOUs();
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
  } = usePOCCoursesForDropdown();
  const {
    data: umbrellas,
    isLoading: umbrellasLoading,
    error: umbrellasError,
  } = useBPRNDUmbrellas();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  const isBPRND = type === 'bprnd';

  // Debug logging
  console.log('MOUs in dropdown:', mous);
  console.log('MOUs loading:', mousLoading);
  console.log('MOUs error:', mousError);
  console.log('Courses in dropdown:', courses);
  console.log('Courses loading:', coursesLoading);
  console.log('Courses error:', coursesError);
  console.log('Total courses available:', courses.length);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCourseDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    if (isBPRND) {
      if (!umbrella.trim()) {
        toast({
          title: 'No umbrella selected',
          description: 'Please select an umbrella for the students',
          variant: 'destructive',
        });
        return;
      }
    } else {
      if (!selectedMOU) {
        toast({
          title: 'No MOU selected',
          description: 'Please select an MOU for the students',
          variant: 'destructive',
        });
        return;
      }

      if (!selectedCourse) {
        toast({
          title: 'No course selected',
          description: 'Please select a course for the students',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsUploading(true);

    try {
      if (isBPRND) {
        // BPRND POC upload logic
        const formData = new FormData();
        formData.append('excelFile', selectedFile);
        formData.append('umbrella', umbrella.trim());

        const response = await fetch(
          'http://localhost:3003/api/bprnd/students/upload',
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload file');
        }

        const data = await response.json();

        // Show popup with full response
        alert(`BPRND Upload Response:\n\n${JSON.stringify(data, null, 2)}`);

        toast({
          title: 'Upload Successful',
          description: `Successfully processed ${
            data.data?.totalProcessed || 0
          } students`,
        });

        setSelectedFile(null);
        setUmbrella('');
      } else {
        // Normal POC upload logic
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('mouId', selectedMOU);
        formData.append('courseId', selectedCourse);

        const pocToken = localStorage.getItem('pocToken');
        const pocUserId = localStorage.getItem('pocUserId');

        if (!pocToken || !pocUserId) {
          throw new Error('Authentication required');
        }

        const response = await fetch(
          `http://localhost:3002/api/poc/${pocUserId}/bulk-import-students`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${pocToken}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            const results = data.results;
            toast({
              title: 'Upload Successful',
              description: `Successfully imported ${results.successCount} students. ${results.errorCount} errors.`,
            });

            // Log detailed results for debugging
            console.log('Import Results:', results);

            setSelectedFile(null);
            setSelectedMOU('');
            setSelectedCourse('');
          } else {
            throw new Error(data.error || 'Upload failed');
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description:
          error.message || 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = `srNo,batchNo,rank,serialNumberRRU,enrollmentNumber,fullName,gender,dateOfBirth,birthPlace,birthState,country,aadharNo,mobileNumber,alternateNumber,email,address
1,BATCH2024-01,1,RRU001,ENR001,John Doe,Male,1995-03-15,Mumbai,Maharashtra,India,123456789012,9876543210,9876543211,john.doe@example.com,"123 Main Street, Mumbai, Maharashtra, India"
2,BATCH2024-01,2,RRU002,ENR002,Jane Smith,Female,1996-07-22,Delhi,Delhi,India,123456789013,9876543212,9876543213,jane.smith@example.com,"456 Park Avenue, Delhi, Delhi, India"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poc_students_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: 'Template Downloaded',
      description: 'CSV template has been downloaded successfully',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bulk Import Students
        </h1>
        <p className="text-gray-600">
          Import multiple students from a CSV or Excel file. Make sure your file
          follows the required format.
        </p>
      </div>

      {/* Instructions Card */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Required Fields:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• srNo (Serial Number)</li>
                <li>• batchNo (Batch Number)</li>
                <li>• rank (Rank)</li>
                <li>• serialNumberRRU (RRU Serial Number)</li>
                <li>• enrollmentNumber (Enrollment Number)</li>
                <li>• fullName (Full Name)</li>
                <li>• gender (Male/Female/Other)</li>
                <li>• dateOfBirth (YYYY-MM-DD)</li>
                <li>• birthPlace (Birth Place)</li>
                <li>• birthState (Birth State)</li>
                <li>• country (Country)</li>
                <li>• aadharNo (12-digit Aadhar Number)</li>
                <li>• mobileNumber (10-digit Mobile Number)</li>
                <li>• alternateNumber (10-digit Alternate Number)</li>
                <li>• email (Valid Email Address)</li>
                <li>• address (Complete Address)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Important Notes:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All fields are required</li>
                <li>• Email addresses must be unique</li>
                <li>• Aadhar numbers must be 12 digits</li>
                <li>• Mobile numbers must be 10 digits</li>
                <li>• MOU will be assigned from the dropdown selection</li>
                <li>• Date format: YYYY-MM-DD</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-green-600" />
              <span>Upload File</span>
            </CardTitle>
            <CardDescription>
              Select a CSV or Excel file to import students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile ? selectedFile.name : 'Click to select file'}
                  </p>
                  <p className="text-xs text-gray-500">
                    CSV, Excel files up to 5MB
                  </p>
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedFile.name} (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}

            {isBPRND ? (
              /* Umbrella Selection */
              <div className="space-y-2">
                <Label
                  htmlFor="umbrella"
                  className="text-sm font-medium text-gray-700"
                >
                  Umbrella *{' '}
                  {umbrellasLoading
                    ? '(Loading...)'
                    : `(${(umbrellas?.length || 0)} available)`}
                </Label>
                <Select
                  value={umbrella}
                  onValueChange={(value) => setUmbrella(value)}
                  disabled={umbrellasLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                         umbrellasLoading
                          ? 'Loading umbrellas...'
                          : (umbrellas?.length || 0) === 0
                          ? 'No umbrellas available'
                          : 'Select an umbrella'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(umbrellas || []).map((umbrellaItem) => (
                      <SelectItem
                        key={umbrellaItem._id}
                        value={umbrellaItem.name}
                      >
                        {umbrellaItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {umbrellasError && (
                  <p className="text-xs text-red-500">
                    Error loading umbrellas: {umbrellasError}
                  </p>
                )}
                {!umbrella && !umbrellasLoading && (
                  <p className="text-xs text-red-500">
                    Please select an umbrella for the students
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* MOU Selection Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Select MOU for Students *{' '}
                    {mousLoading
                      ? '(Loading...)'
                      : `(${mous.length} available)`}
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <span
                        className={
                          selectedMOU ? 'text-gray-900' : 'text-gray-500'
                        }
                      >
                        {selectedMOU
                          ? mous.find((mou) => mou._id === selectedMOU)
                              ?.nameOfPartnerInstitution || 'Select MOU'
                          : 'Select MOU'}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {mousLoading ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            Loading MOUs...
                          </div>
                        ) : mousError ? (
                          <div className="px-3 py-2 text-sm text-red-500">
                            Error loading MOUs: {mousError}
                          </div>
                        ) : mous.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No MOUs available
                          </div>
                        ) : (
                          mous.map((mou) => (
                            <button
                              key={mou._id}
                              onClick={() => {
                                setSelectedMOU(mou._id);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                              <div className="font-medium text-gray-900">
                                {mou.nameOfPartnerInstitution}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {mou.ID}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {!selectedMOU && (
                    <p className="text-xs text-red-500">
                      Please select an MOU for the students
                    </p>
                  )}
                </div>

                {/* Course Selection Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Select Course for Students *{' '}
                    {coursesLoading
                      ? '(Loading...)'
                      : `(${courses.length} available)`}
                  </label>
                  <div className="relative" ref={courseDropdownRef}>
                    <button
                      type="button"
                      onClick={() =>
                        setIsCourseDropdownOpen(!isCourseDropdownOpen)
                      }
                      className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <span
                        className={
                          selectedCourse ? 'text-gray-900' : 'text-gray-500'
                        }
                      >
                        {selectedCourse
                          ? courses.find(
                              (course) => course._id === selectedCourse
                            )?.courseName || 'Select Course'
                          : 'Select Course'}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          isCourseDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isCourseDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {coursesLoading ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            Loading courses...
                          </div>
                        ) : coursesError ? (
                          <div className="px-3 py-2 text-sm text-red-500">
                            Error loading courses: {coursesError}
                          </div>
                        ) : courses.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No courses available
                          </div>
                        ) : (
                          courses.map((course) => (
                            <button
                              key={course._id}
                              onClick={() => {
                                setSelectedCourse(course._id);
                                setIsCourseDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                              <div className="font-medium text-gray-900">
                                {course.courseName}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {course.ID} | Duration: {course.duration} |
                                Credits:{' '}
                                {course.indoorCredits + course.outdoorCredits}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {!selectedCourse && (
                    <p className="text-xs text-red-500">
                      Please select a course for the students
                    </p>
                  )}
                </div>
              </>
            )}

            <Button
              onClick={handleUpload}
              disabled={
                !selectedFile ||
                (isBPRND
                  ? !umbrella.trim()
                  : !selectedMOU || !selectedCourse) ||
                isUploading
              }
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Import...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Students
                </>
              )}
            </Button>

            {isUploading && (
              <div className="text-center text-sm text-gray-500 mt-2">
                Please wait while we process your file...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Download */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-blue-600" />
              <span>Download Template</span>
            </CardTitle>
            <CardDescription>
              Get a sample CSV file with the correct format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">CSV Template</p>
                  <p className="text-sm text-gray-500">
                    Sample file with all required fields
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Imports */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Recent Imports</span>
          </CardTitle>
          <CardDescription>
            Track your recent bulk import activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent imports found</p>
            <p className="text-sm">Your import history will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default POCBulkImportStudentsPage;
