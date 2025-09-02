import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Download, Search, Filter, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CertificateMapping {
  _id: string;
  certificateId: {
    _id: string;
    certificateNo: string;
  };
  studentId: {
    _id: string;
    Name: string;
    email: string;
    State: string;
    Umbrella: string;
  };
  umbrellaKey: string;
  qualification: string;
  totalCreditsRequired: number;
  courses: Array<{
    courseId: string;
    courseName: string;
    organization: string;
    theoryHours: number;
    practicalHours: number;
    totalCredits: number;
    creditsUsed: number;
    completionDate: string;
    pdfPath?: string;
    pdfFileName?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  totalCreditsUsed?: number;
  remainingCredits?: number;
  creditEfficiency?: number;
  courseCount?: number;
}

const CertificateMappingsListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mappings, setMappings] = useState<CertificateMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterQualification, setFilterQualification] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (!token || !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate('/admin/login');
      return;
    }
  }, [navigate, toast]);

  // Fetch certificate mappings
  const fetchMappings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authentication token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await fetch('http://localhost:3002/api/certificate-course-mappings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Authentication error - redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('isAuthenticated');
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          navigate('/admin/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMappings(data.data || []);
        setTotalPages(Math.ceil((data.data?.length || 0) / itemsPerPage));
      } else {
        throw new Error(data.message || 'Failed to fetch mappings');
      }
    } catch (err) {
      console.error('Error fetching certificate mappings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch certificate mappings');
      toast({
        title: "Error",
        description: "Failed to fetch certificate mappings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchMappings();
  }, []);

  // Filter and paginate mappings
  const filteredMappings = mappings.filter(mapping => {
    const matchesSearch = 
      mapping.studentId?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.umbrellaKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.certificateId?.certificateNo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesQualification = filterQualification === "all" || mapping.qualification === filterQualification;
    
    return matchesSearch && matchesQualification;
  });

  const paginatedMappings = filteredMappings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate derived values (use backend values when available, fallback to calculation)
  const calculateTotalCreditsUsed = (mapping: CertificateMapping) => {
    return mapping.totalCreditsUsed || mapping.courses.reduce((total, course) => total + course.creditsUsed, 0);
  };

  const calculateRemainingCredits = (mapping: CertificateMapping) => {
    return mapping.remainingCredits || (mapping.totalCreditsRequired - calculateTotalCreditsUsed(mapping));
  };

  const calculateCreditEfficiency = (mapping: CertificateMapping) => {
    if (mapping.creditEfficiency !== undefined) {
      return mapping.creditEfficiency.toString();
    }
    const totalUsed = calculateTotalCreditsUsed(mapping);
    return totalUsed > 0 ? ((totalUsed / mapping.totalCreditsRequired) * 100).toFixed(1) : '0.0';
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Certificate ID',
      'Student Name',
      'Email',
      'Umbrella',
      'Qualification',
      'Total Credits Earned',
      'Credits Used for Certification',
      'Credits Required for Certification',
      'Credit Efficiency (%)',
      'Course Count',
      'Created Date'
    ];

    const csvData = filteredMappings.map(mapping => [
      mapping.certificateId?.certificateNo || 'N/A',
      mapping.studentId?.Name || 'N/A',
      mapping.studentId?.email || 'N/A',
      mapping.umbrellaKey.replace(/_/g, ' '), // Show certification umbrella (formatted)
      mapping.qualification,
      mapping.courses.reduce((total, course) => total + course.totalCredits, 0).toFixed(2),
      calculateTotalCreditsUsed(mapping),
      mapping.totalCreditsRequired,
      calculateCreditEfficiency(mapping),
      mapping.courses.length,
      new Date(mapping.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-mappings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Certificate mappings exported to CSV",
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading certificate mappings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50 border border-red-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchMappings} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Certificate Course Mappings</h1>
          <p className="text-gray-600 mt-2">
            View and manage certificate-course mappings and credit usage
          </p>
        </div>
        
        <Button onClick={exportToCSV} className="bg-gray-800 hover:bg-gray-900 text-white">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by certificate ID, student name, email, umbrella, or qualification..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={filterQualification} onValueChange={setFilterQualification}>
                <SelectTrigger className="border-gray-300 focus:border-gray-400 focus:ring-gray-400">
                  <SelectValue placeholder="Filter by qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Qualifications</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="pg diploma">PG Diploma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{mappings.length}</p>
            <p className="text-sm text-gray-600">Total Mappings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{filteredMappings.length}</p>
            <p className="text-sm text-gray-600">Filtered Results</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {mappings.reduce((total, mapping) => total + mapping.courses.length, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Courses</p>
          </div>
        </div>
        <Button
          onClick={fetchMappings}
          variant="outline"
          size="sm"
          className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Mappings Table */}
      {filteredMappings.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg">No certificate mappings found</p>
            <p className="text-gray-400 mt-2">
              {searchTerm || filterQualification !== "all" 
                ? "Try adjusting your search or filters"
                : "No mappings have been created yet"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedMappings.map((mapping) => (
            <Card key={mapping._id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg text-gray-900">
                        {mapping.studentId?.Name || 'Unknown Student'}
                      </CardTitle>
                      <Badge variant="outline" className="text-gray-700 border-gray-300 text-xs">
                        {mapping.certificateId?.certificateNo || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span><strong>Email:</strong> {mapping.studentId?.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <Badge variant="outline" className="text-gray-700 border-gray-300">
                        {mapping.umbrellaKey.replace(/_/g, ' ')}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">Certification Field</p>
                    </div>
                    <Badge variant="secondary" className="text-gray-700 bg-gray-100">
                      {mapping.qualification}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Courses ({mapping.courseCount || mapping.courses.length})</h4>
                  <div className="space-y-2">
                    {mapping.courses.map((course, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{course.courseName} - {course.organization}</p>
                          <div className="flex gap-4 text-xs text-gray-500 mt-1">
                            <span>Theory: {course.theoryHours}h</span>
                            <span>Practical: {course.practicalHours}h</span>
                            <span>Credits Earned: {course.totalCredits}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="text-gray-700 border-gray-300">
                              {course.creditsUsed} credits used for certification
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(course.completionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4 text-xs text-gray-500">
                  Created: {new Date(mapping.createdAt).toLocaleString()} | 
                  Updated: {new Date(mapping.updatedAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default CertificateMappingsListPage;
