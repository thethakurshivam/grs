import React, { useState } from 'react';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { POCComponentProps } from '@/types/poc';

const BulkImportStudents: React.FC<POCComponentProps> = ({
  type = 'standard',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.name.match(/\.(csv|xlsx)$/)) {
        setError('Please upload a CSV or Excel file');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type); // Send the POC type

    try {
      const response = await fetch(
        `${process.env.VITE_API_URL}/api/poc/bulk-import-students`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('pocToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      setSuccess(`Successfully imported ${data.importedCount} students`);
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to import students'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Students</CardTitle>
          <CardDescription>
            Upload a CSV or Excel file containing student information for bulk
            import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="text-center">
                <h3 className="text-lg font-medium">
                  {file ? file.name : 'Drop your file here'}
                </h3>
                <p className="text-sm text-gray-500">
                  {file
                    ? `${(file.size / 1024).toFixed(2)} KB`
                    : 'CSV or Excel file up to 10MB'}
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv,.xlsx"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button type="button" variant="outline">
                  <FileUp className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </label>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload and Import'}
          </Button>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-700" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* File Format Guide */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">File Format Guide</h4>
            <p className="text-sm text-gray-600">
              Your CSV/Excel file should include the following columns:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              <li>Name (required)</li>
              <li>Email (required, must be unique)</li>
              <li>Phone Number (required)</li>
              <li>Course (required)</li>
              <li>School/College Name (required)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkImportStudents;
