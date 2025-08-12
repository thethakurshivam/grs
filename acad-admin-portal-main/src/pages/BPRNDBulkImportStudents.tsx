import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const BPRNDBulkImportStudents: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [umbrella, setUmbrella] = useState<string>('');
  const [umbrellaOptions, setUmbrellaOptions] = useState<string[]>([]);

  // Fetch umbrella options when component mounts
  useEffect(() => {
    const fetchUmbrellaOptions = async () => {
      try {
        const response = await fetch(`${process.env.VITE_API_URL}/api/umbrellas`);
        if (!response.ok) throw new Error('Failed to fetch umbrella options');
        const data = await response.json();
        setUmbrellaOptions(data.map((u: { name: string }) => u.name));
      } catch (err) {
        console.error('Error fetching umbrella options:', err);
        setError('Failed to load umbrella options');
      }
    };

    fetchUmbrellaOptions();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx)$/)) {
        setError('Please upload an Excel file');
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

    try {
      const response = await fetch(
        `${process.env.VITE_API_URL}/api/bprnd/students/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('pocToken')}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const data = await response.json();
      setSuccess(`Successfully processed ${data.data.totalProcessed} students`);
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
          <CardTitle>BPRND Bulk Import Students</CardTitle>
          <CardDescription>
            Upload an Excel file containing student information for bulk import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Umbrella Selection */}
          <div className="space-y-2">
            <Label htmlFor="umbrella">Umbrella</Label>
            <Select
              value={umbrella}
              onValueChange={(value) => setUmbrella(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an umbrella" />
              </SelectTrigger>
              <SelectContent>
                {umbrellaOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                    : 'Excel file up to 10MB'}
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx"
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
            disabled={!file || !umbrella || uploading}
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
              Your Excel file should include the following columns:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              <li>Name (required)</li>
              <li>Designation (required)</li>
              <li>State (required)</li>
              <li>Training Topic (required)</li>
              <li>Per Session Minutes (required)</li>
              <li>Theory Sessions (required)</li>
              <li>Practical Sessions (required)</li>
              <li>Theory Hours (required)</li>
              <li>Practical Hours (required)</li>
              <li>Total Hours (required)</li>
              <li>Theory Credits (required)</li>
              <li>Practical Credits (required)</li>
              <li>Total Credits (required)</li>
              <li>Date of Birth (required)</li>
              <li>Email (required, must be unique)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BPRNDBulkImportStudents;
