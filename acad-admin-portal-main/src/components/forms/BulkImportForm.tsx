import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileText, AlertCircle } from "lucide-react";

interface BulkImportFormProps {
  type: "mou" | "courses" | "students";
  title: string;
  description: string;
}

const BulkImportForm = ({ type, title, description }: BulkImportFormProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV or Excel file",
          variant: "destructive",
        });
        return;
      }
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
      // Get authentication token
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again to continue",
          variant: "destructive",
        });
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      // Determine the correct API endpoint based on type
      let apiEndpoint = '';
      switch (type) {
        case 'mou':
          apiEndpoint = 'http://localhost:3000/api/mous/import';
          break;
        case 'courses':
          apiEndpoint = 'http://localhost:3000/api/courses/import';
          break;
        case 'students':
          apiEndpoint = 'http://localhost:3000/api/participants/import';
          break;
        default:
          throw new Error('Invalid import type');
      }

      // API call to backend bulk import endpoint
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header for FormData - browser will set it automatically with boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Show detailed results if available
        let successMessage = data.message || `${selectedFile.name} has been uploaded successfully!`;
        
        if (data.results) {
          const { totalRows, successCount, errorCount, duplicateCount } = data.results;
          successMessage = `Import completed! ${successCount} records imported successfully, ${errorCount} errors, ${duplicateCount} duplicates out of ${totalRows} total rows.`;
        }

        toast({
          title: "Success",
          description: successMessage,
        });

        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to upload file. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Simulate template download
    toast({
      title: "Template Downloaded",
      description: `${type} template has been downloaded to your computer`,
    });
  };

  const getIcon = () => {
    switch (type) {
      case "mou":
        return FileText;
      case "courses":
        return FileText;
      case "students":
        return FileText;
      default:
        return FileText;
    }
  };

  const Icon = getIcon();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload File
            </CardTitle>
            <CardDescription>
              Select and upload your {type} data file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Choose File</Label>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary-hover
                  file:cursor-pointer cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Template & Instructions
            </CardTitle>
            <CardDescription>
              Download template and follow guidelines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">File Format</p>
                  <p className="text-muted-foreground">Supported formats: CSV, XLSX</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Required Fields</p>
                  <p className="text-muted-foreground">
                    {type === "mou" ? "ID, nameOfPartnerInstitution, strategicAreas" :
                     type === "courses" ? "ID, Name, eligibleDepartments, startDate, endDate, field" :
                     "All mandatory fields as per template"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Data Validation</p>
                  <p className="text-muted-foreground">
                    Data will be validated before import
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>
            Your recent bulk import activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">sample_data.xlsx</p>
                <p className="text-sm text-muted-foreground">Uploaded 2 hours ago • 150 records</p>
              </div>
              <div className="text-sm text-green-600 font-medium">Success</div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">bulk_import.csv</p>
                <p className="text-sm text-muted-foreground">Uploaded yesterday • 75 records</p>
              </div>
              <div className="text-sm text-green-600 font-medium">Success</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkImportForm;