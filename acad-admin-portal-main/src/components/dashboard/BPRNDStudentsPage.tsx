import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Users, Search, Filter, TrendingUp, Award, MapPin, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Student {
  _id: string;
  Name: string;
  Designation: string;
  State: string;
  Training_Topic: string;
  Umbrella: string;
  Total_Credits: number;
  email: string;
  date_of_birth: string;
  // Dynamic umbrella fields - will include all current and future umbrellas
  [key: string]: any; // Allow any additional umbrella fields
}

const BPRNDStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.Designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.State.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.Umbrella && student.Umbrella.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.Training_Topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3003/api/bprnd/students');
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data);
        setFilteredStudents(data.data);
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredStudents.length === 0) return;

    // Use the global umbrellaFields variable
    // Create dynamic headers
    const headers = [
      'Name',
      'Designation',
      'State',
      'Training Topic',
      'Total Credits',
      ...umbrellaFields.map(field => field.replace(/_/g, ' ')), // Convert "Tourism_Police" to "Tourism Police"
      'Email',
      'Date of Birth'
    ];

    const csvData = filteredStudents.map(student => [
      student.Name,
      student.Designation,
      student.State,
      student.Training_Topic,
      student.Total_Credits,
      ...umbrellaFields.map(field => student[field] || 0), // Get credit values for each umbrella
      student.email,
      new Date(student.date_of_birth).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bprnd-students-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCredits = (credits: any) => {
    // Ensure credits is a valid number
    const numericCredits = Number(credits);
    if (isNaN(numericCredits)) {
      return '0';
    }
    return numericCredits.toFixed(2);
  };

  // Function to get umbrella fields dynamically
  const getUmbrellaFields = () => {
    if (filteredStudents.length === 0) return [];
    const firstStudent = filteredStudents[0];
    return Object.keys(firstStudent).filter(key => 
      key.includes('_') && 
      key !== 'date_of_birth' && 
      key !== 'createdAt' && 
      key !== 'updatedAt' && 
      key !== '__v' &&
      key !== 'customId' &&
      key !== 'Per_session_minutes' &&
      key !== 'Theory_sessions' &&
      key !== 'Practical_sessions' &&
      key !== 'Theory_Hours' &&
      key !== 'Practical_Hours' &&
      key !== 'Theory_Credits' &&
      key !== 'Practical_Credits'
    );
  };

  const umbrellaFields = getUmbrellaFields();


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="text-slate-600 text-lg font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Students</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <Button onClick={fetchStudents} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/poc-portal/bprnd')}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">BPR&D Candidates</h1>
              <p className="text-slate-600 mt-1">Comprehensive overview of all registered students and their credit progress</p>
            </div>
          </div>
          <Button
            onClick={exportToCSV}
            disabled={filteredStudents.length === 0}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{students.length}</p>
                  <p className="text-sm text-slate-600">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {students.reduce((sum, student) => sum + student.Total_Credits, 0).toFixed(1)}
                  </p>
                  <p className="text-sm text-slate-600">Total Credits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {(students.reduce((sum, student) => sum + student.Total_Credits, 0) / students.length).toFixed(1)}
                  </p>
                  <p className="text-sm text-slate-600">Avg. Credits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {new Set(students.map(s => s.State)).size}
                  </p>
                  <p className="text-sm text-slate-600">States</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">Student Directory</h2>
                <Badge variant="secondary" className="ml-2">
                  {filteredStudents.length} students
                </Badge>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, designation, state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                                 <TableRow className="bg-slate-50 hover:bg-slate-50">
                   <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider px-6 py-4">
                     Student
                   </TableHead>
                   <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider px-6 py-4">
                     Location
                   </TableHead>
                   <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider px-6 py-4">
                     Total Credits
                   </TableHead>
                   {umbrellaFields.map((field) => (
                     <TableHead key={field} className="text-xs font-semibold text-slate-700 uppercase tracking-wider px-6 py-4">
                       {field.replace(/_/g, ' ')}
                     </TableHead>
                   ))}
                   <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider px-6 py-4">
                     Contact
                   </TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                                         <TableCell colSpan={3 + umbrellaFields.length + 1} className="text-center py-16">
                      <div className="space-y-3">
                        <Users className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="text-slate-500 font-medium">
                          {searchTerm ? 'No students found matching your search.' : 'No students available.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow 
                      key={student._id} 
                      className="hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100"
                    >
                      <TableCell className="px-6 py-4 border-r border-slate-200">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900">{student.Name}</p>
                          <p className="text-sm text-slate-600">{student.Designation}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 border-r border-slate-200">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700">{student.State}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 border-r border-slate-200">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900">{formatCredits(student.Total_Credits)}</p>
                        </div>
                      </TableCell>
                      {umbrellaFields.map((field) => (
                        <TableCell key={field} className="px-6 py-4 border-r border-slate-200">
                          <span className="text-slate-700 font-medium">{formatCredits(student[field] || 0)}</span>
                        </TableCell>
                      ))}
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600 truncate max-w-[200px]">
                              {student.email}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {new Date(student.date_of_birth).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>


      </div>
    </div>
  );
};

export default BPRNDStudentsPage;
