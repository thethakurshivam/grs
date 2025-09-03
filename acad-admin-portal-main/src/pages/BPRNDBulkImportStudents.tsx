import React, { useState, useEffect } from 'react';
import { Upload, FileUp, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useBPRNDUmbrellas } from '@/hooks/useBPRNDUmbrellas';
import { useNavigate } from 'react-router-dom';

const BPRNDBulkImportStudents: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [umbrella, setUmbrella] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  
  const navigate = useNavigate();

  // Use the hook to fetch umbrella options with error handling
  const { umbrellas, isLoading: umbrellasLoading, error: umbrellasError } = useBPRNDUmbrellas();

  // Debug logging
  console.log('BPRNDBulkImportStudents render state:', {
    umbrellas,
    umbrellasLoading,
    umbrellasError,
    umbrellasType: typeof umbrellas,
    umbrellasIsArray: Array.isArray(umbrellas),
    umbrellasLength: umbrellas?.length,
    file: file ? { name: file.name, size: file.size, type: file.type } : null,
    umbrella,
    uploading,
    error,
    success
  });

  // Add safety check to prevent crashes
  if (umbrellasError) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">BPRND Bulk Import Students</CardTitle>
              <CardDescription className="text-gray-600">
                Error loading umbrella options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-red-800">Failed to Load Umbrellas</AlertTitle>
                <AlertDescription className="text-red-700">
                  {umbrellasError}. Please refresh the page or contact support.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Additional safety check for invalid umbrella data
  if (!umbrellasLoading && (!umbrellas || !Array.isArray(umbrellas))) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">BPRND Bulk Import Students</CardTitle>
              <CardDescription className="text-gray-600">
                Invalid umbrella data received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-red-800">Data Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  Invalid umbrella data received from server. Please refresh the page or contact support.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading state while fetching umbrellas
  if (umbrellasLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">BPRND Bulk Import Students</CardTitle>
              <CardDescription className="text-gray-600">
                Loading umbrella options...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading umbrellas...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File change event triggered:', event);
    const selectedFile = event.target.files?.[0];
    console.log('Selected file:', selectedFile);
    
    if (selectedFile) {
      console.log('File validation - name:', selectedFile.name, 'size:', selectedFile.size);
      if (!selectedFile.name.match(/\.(xlsx)$/)) {
        console.log('Invalid file type detected');
        setError('Please upload an Excel file (.xlsx)');
        return;
      }
      console.log('File is valid, setting file state');
      setFile(selectedFile);
      setError(null);
    } else {
      console.log('No file selected');
    }
  };

  const handleUpload = async () => {
    console.log('Upload process started');
    console.log('File state:', file);
    console.log('Umbrella state:', umbrella);
    
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!umbrella) {
      setError('Please select an umbrella');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('umbrella', umbrella);
    
    // Debug FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      console.log('Making API call to:', 'http://localhost:3003/api/bprnd/students/upload');
      console.log('Request headers:', {
        Authorization: `Bearer ${localStorage.getItem('pocToken')}`,
      });
      
      const response = await fetch(
        'http://localhost:3003/api/bprnd/students/upload',
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('pocToken')}`,
          },
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('API success response:', data);
      
      // Show success popup
      setPopupMessage(`Successfully processed ${data.data.totalProcessed || data.data.created?.length || 0} students!`);
      setShowPopup(true);
      setCountdown(5);
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowPopup(false);
            navigate('/poc-portal/bprnd');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setSuccess(`Successfully processed ${data.data.totalProcessed || data.data.created?.length || 0} students`);
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to import students'
      );
    } finally {
      setUploading(false);
    }
  };

      return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bulk Import Students</h1>
              <p className="text-gray-600 mt-1">Upload Excel file to import multiple students at once</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/poc-portal/bprnd')}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Main Form Card */}
          <Card className="border-0 shadow-sm bg-gray-50">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold text-gray-900">Import Configuration</CardTitle>
            <CardDescription className="text-gray-600">
              Select umbrella and upload your Excel file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Umbrella Selection */}
            <div className="space-y-3">
              <Label htmlFor="umbrella" className="text-sm font-medium text-gray-700">Umbrella</Label>
              {umbrellas && umbrellas.length > 0 ? (
                <Select
                  value={umbrella}
                  onValueChange={(value) => setUmbrella(value)}
                  disabled={umbrellasLoading}
                >
                  <SelectTrigger className="w-full border-gray-300 bg-white hover:bg-gray-50 focus:border-gray-400 focus:ring-gray-400">
                    <SelectValue placeholder="Select an umbrella" className="text-gray-900 placeholder:text-gray-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 shadow-lg">
                    {umbrellas.map((option) => (
                      <SelectItem 
                        key={option.name} 
                        value={option.name}
                        className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                      >
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  No umbrellas available. Please contact support.
                </div>
              )}
              {umbrellasError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  Failed to load umbrella options: {umbrellasError}
                </div>
              )}
            </div>

            {/* File Upload Area */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Excel File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <Upload className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {file ? file.name : 'Drop your Excel file here'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {file
                        ? `${(file.size / 1024).toFixed(2)} KB`
                        : 'Supports .xlsx files up to 10MB'}
                    </p>
                  </div>
                  
                  {/* File Upload Button */}
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".xlsx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="file-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500"
                      onClick={() => {
                        console.log('Button clicked, triggering file input');
                        document.getElementById('file-upload')?.click();
                      }}
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Select File
                    </Button>
                  </div>
                  
                  {/* File Info */}
                  {file && (
                    <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md font-medium">
                      ✓ File selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || !umbrella || uploading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload and Import'}
            </Button>

            {/* Messages */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800 font-medium">Error</AlertTitle>
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 font-medium">Success</AlertTitle>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* File Format Guide */}
        <Card className="border-0 shadow-sm bg-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">File Format Requirements</CardTitle>
            <CardDescription className="text-gray-600">
              Ensure your Excel file contains the following columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Required Fields</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Name</li>
                  <li>• Designation</li>
                  <li>• State</li>
                  <li>• Training Topic</li>
                  <li>• Email (must be unique)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Additional Fields</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Per Session Minutes</li>
                  <li>• Theory/Practical Sessions</li>
                  <li>• Theory/Practical Hours</li>
                  <li>• Theory/Practical Credits</li>
                  <li>• Date of Birth</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md mx-4 text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h3>
              <p className="text-gray-700 mb-4">{popupMessage}</p>
              <p className="text-sm text-gray-500">Redirecting to dashboard in {countdown} seconds...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BPRNDBulkImportStudents;
