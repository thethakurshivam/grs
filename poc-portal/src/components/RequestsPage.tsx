import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowLeft, 
  Search, 
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react';

interface RequestsPageProps {
  user: any;
  onLogout: () => void;
}

const RequestsPage = ({ user, onLogout }: RequestsPageProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data for requests
  const [requests] = useState([
    {
      id: 1,
      title: 'Course Registration Request',
      requester: 'John Doe',
      email: 'john.doe@example.com',
      type: 'Course Registration',
      status: 'pending',
      submittedDate: '2024-01-15',
      priority: 'medium',
      description: 'Request to register for Advanced Computer Science course starting next semester.'
    },
    {
      id: 2,
      title: 'MOU Renewal Request',
      requester: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      type: 'MOU Management',
      status: 'approved',
      submittedDate: '2024-01-10',
      priority: 'high',
      description: 'Request to renew the Memorandum of Understanding with Tech University for another 3 years.'
    },
    {
      id: 3,
      title: 'Student Certificate Request',
      requester: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      type: 'Certificate',
      status: 'rejected',
      submittedDate: '2024-01-08',
      priority: 'low',
      description: 'Request for duplicate certificate for Computer Science degree completion.'
    },
    {
      id: 4,
      title: 'Faculty Development Program',
      requester: 'Prof. Emily Davis',
      email: 'emily.davis@example.com',
      type: 'Faculty Development',
      status: 'pending',
      submittedDate: '2024-01-12',
      priority: 'high',
      description: 'Request to organize faculty development program on modern teaching methodologies.'
    },
    {
      id: 5,
      title: 'Library Resource Request',
      requester: 'David Brown',
      email: 'david.brown@example.com',
      type: 'Resource Management',
      status: 'approved',
      submittedDate: '2024-01-05',
      priority: 'medium',
      description: 'Request to add new digital resources and books to the library collection.'
    },
    {
      id: 6,
      title: 'IT Support Request',
      requester: 'Lisa Thompson',
      email: 'lisa.thompson@example.com',
      type: 'IT Support',
      status: 'pending',
      submittedDate: '2024-01-14',
      priority: 'high',
      description: 'Request for IT support to resolve network connectivity issues in the computer lab.'
    }
  ]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || request.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = (id: number) => {
    // Handle approve logic
    console.log('Approving request:', id);
  };

  const handleReject = (id: number) => {
    // Handle reject logic
    console.log('Rejecting request:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
              <p className="text-gray-600 mt-2">
                Review and manage all pending approval requests
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-primary-600">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests by title, requester, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)} flex items-center space-x-1`}>
                      {getStatusIcon(request.status)}
                      <span>{request.status}</span>
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{request.requester}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MessageSquare className="h-4 w-4" />
                      <span>{request.type}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {request.description}
                  </p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button className="btn-primary text-sm flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(request.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Request ID: #{request.id}</span>
                  <span className="text-gray-500">{request.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RequestsPage; 