import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const POCStudentsListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');

  const mockStudents = [
    { id: 1, name: 'John Doe', email: 'john@example.com', gender: 'Male', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', gender: 'Female', status: 'Active', joinDate: '2024-01-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', gender: 'Male', status: 'Pending', joinDate: '2024-02-01' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', gender: 'Female', status: 'Active', joinDate: '2024-01-10' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', gender: 'Male', status: 'Active', joinDate: '2024-01-25' },
    { id: 6, name: 'Diana Davis', email: 'diana@example.com', gender: 'Female', status: 'Active', joinDate: '2024-01-30' },
    { id: 7, name: 'Edward Miller', email: 'edward@example.com', gender: 'Male', status: 'Pending', joinDate: '2024-02-05' },
    { id: 8, name: 'Fiona Garcia', email: 'fiona@example.com', gender: 'Female', status: 'Active', joinDate: '2024-01-18' }
  ];

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === 'all' || student.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/poc-portal/students')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Students</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">All Students</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">All Students</h2>
          <p className="text-gray-600">Complete list of all students in the POC program</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <Button>
              Add New Student
            </Button>
          </div>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Student Directory</CardTitle>
            <CardDescription>Showing {filteredStudents.length} of {mockStudents.length} students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.gender === 'Male' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {student.gender}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.status}
                    </span>
                    <span className="text-sm text-gray-500">{student.joinDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterGender !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No students are registered yet.'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default POCStudentsListPage; 