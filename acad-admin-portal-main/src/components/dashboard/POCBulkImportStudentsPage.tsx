import React, { useState } from 'react';
import { Upload, Download, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const POCBulkImportStudentsPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      const pocToken = localStorage.getItem('pocToken');
      const pocUserId = localStorage.getItem('pocUserId');

      if (!pocToken || !pocUserId) {
        throw new Error('Authentication required');
      }

      // TODO: Replace with actual POC bulk import endpoint
      const response = await fetch(`http://localhost:3002/api/poc/${pocUserId}/bulk-import-students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pocToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Upload Successful",
          description: `Successfully imported ${data.importedCount || 0} students`,
        });
        setSelectedFile(null);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = `srNo,batchNo,rank,serialNumberRRU,enrollmentNumber,fullName,gender,dateOfBirth,birthPlace,birthState,country,aadharNo,mobileNumber,alternateNumber,email,address,mou_id
1,BATCH2024-01,1,RRU001,ENR001,John Doe,Male,1995-03-15,Mumbai,Maharashtra,India,123456789012,9876543210,9876543211,john.doe@example.com,"123 Main Street, Mumbai, Maharashtra, India",MOU001
2,BATCH2024-01,2,RRU002,ENR002,Jane Smith,Female,1996-07-22,Delhi,Delhi,India,123456789013,9876543212,9876543213,jane.smith@example.com,"456 Park Avenue, Delhi, Delhi, India",MOU001`;

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
      title: "Template Downloaded",
      description: "CSV template has been downloaded successfully",
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
          Import multiple students from a CSV or Excel file. Make sure your file follows the required format.
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
              <h4 className="font-semibold text-gray-900 mb-2">Required Fields:</h4>
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
                <li>• mou_id (MOU ID - must exist in your MOUs)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All fields are required</li>
                <li>• Email addresses must be unique</li>
                <li>• Aadhar numbers must be 12 digits</li>
                <li>• Mobile numbers must be 10 digits</li>
                <li>• MOU ID must exist in your POC's MOUs</li>
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
                    {selectedFile ? selectedFile.name : "Click to select file"}
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
                  <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Students
                </>
              )}
            </Button>
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
                  <p className="text-sm text-gray-500">Sample file with all required fields</p>
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