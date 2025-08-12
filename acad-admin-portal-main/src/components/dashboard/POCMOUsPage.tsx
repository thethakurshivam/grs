import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, ArrowLeft, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props { type?: 'standard' | 'bprnd' }
const POCMOUsPage: React.FC<Props> = ({ type = 'standard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/poc-portal/bprnd') ? '/poc-portal/bprnd' : '/poc-portal';
  const [searchTerm, setSearchTerm] = useState('');

  const mockStats = {
    totalMOUs: 23,
    activeMOUs: 18,
    pendingMOUs: 3,
    expiredMOUs: 2
  };

  const mockMOUs = [
    { id: 1, name: 'TechCorp Partnership', organization: 'TechCorp Inc.', status: 'Active', signedDate: '2024-01-15' },
    { id: 2, name: 'EduTech Collaboration', organization: 'EduTech Solutions', status: 'Active', signedDate: '2024-01-20' },
    { id: 3, name: 'Innovation Hub Agreement', organization: 'Innovation Labs', status: 'Pending', signedDate: '2024-02-01' },
    { id: 4, name: 'Research Partnership', organization: 'Research Institute', status: 'Active', signedDate: '2024-01-10' },
    { id: 5, name: 'Industry Collaboration', organization: 'Industry Partners', status: 'Expired', signedDate: '2023-06-15' }
  ];

  const filteredMOUs = mockMOUs.filter(mou =>
    mou.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mou.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={type === 'bprnd' ? 'min-h-screen bg-blue-50 text-black' : 'min-h-screen bg-gray-50'}>
      {/* Header */}
      <header className={type === 'bprnd' ? 'bg-white shadow-sm border-b border-[#0b2e63]/20' : 'bg-white shadow-sm border-b border-gray-200'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(basePath)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to POC Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">POC MOUs</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className={type === 'bprnd' ? 'text-3xl font-extrabold text-[#0b2e63] mb-2' : 'text-3xl font-bold text-gray-900 mb-2'}>MOUs Management</h2>
          <p className={type === 'bprnd' ? 'text-black/80' : 'text-gray-600'}>Manage and monitor all Memorandums of Understanding</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total MOUs</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.totalMOUs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active MOUs</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.activeMOUs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending MOUs</CardTitle>
              <FileText className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.pendingMOUs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Expired MOUs</CardTitle>
              <FileText className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.expiredMOUs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search MOUs by name or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button>
              Add New MOU
            </Button>
          </div>
        </div>

        {/* MOUs List */}
        <Card>
          <CardHeader>
            <CardTitle>Memorandums of Understanding</CardTitle>
            <CardDescription>All MOUs in the POC program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMOUs.map((mou) => (
                <div key={mou.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{mou.name}</h3>
                      <p className="text-sm text-gray-500">Organization: {mou.organization}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      mou.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : mou.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mou.status}
                    </span>
                    <span className="text-sm text-gray-500">Signed: {mou.signedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default POCMOUsPage; 