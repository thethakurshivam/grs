import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  Search, 
  Plus, 
  Filter,
  Calendar,
  Building,
  Target,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface MOUsPageProps {
  user: any;
  onLogout: () => void;
}

const MOUsPage = ({ user, onLogout }: MOUsPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const backendMOUs = (location.state as any)?.mousFromBackend as Array<any> | undefined;

  // Mock data fallback
  const [mockMOUs] = useState([
    {
      id: 1,
      title: 'Partnership with Tech University',
      organization: 'Tech University',
      strategicAreas: 'Research & Development, Student Exchange',
      dateOfSigning: '2024-01-15',
      validity: '2027-01-15',
      status: 'active',
      type: 'Academic Partnership',
      description: 'Comprehensive partnership agreement for research collaboration and student exchange programs.'
    },
    {
      id: 2,
      title: 'Industry Collaboration with Innovation Corp',
      organization: 'Innovation Corp',
      strategicAreas: 'Industry Training, Internship Programs',
      dateOfSigning: '2024-02-20',
      validity: '2026-02-20',
      status: 'active',
      type: 'Industry Partnership',
      description: 'Collaboration for industry training programs and internship opportunities for students.'
    }
  ]);

  const normalizedMOUs = useMemo(() => {
    if (!backendMOUs || backendMOUs.length === 0) return null;
    return backendMOUs.map((m, idx) => ({
      id: m._id || idx,
      title: m.title || m.name || 'MOU',
      organization: m.organization || m.partner || '—',
      strategicAreas: m.strategicAreas || m.areas || '—',
      dateOfSigning: m.dateOfSigning || m.signedOn || new Date().toISOString(),
      validity: m.validity || m.validTill || new Date().toISOString(),
      status: m.status || 'active',
      type: m.type || '—',
      description: m.description || '—'
    }));
  }, [backendMOUs]);

  const effectiveMOUs = normalizedMOUs ?? mockMOUs;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredMOUs = effectiveMOUs.filter(mou => {
    const matchesSearch = (mou.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (mou.organization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (mou.strategicAreas || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || mou.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const isExpired = (validityDate: string) => new Date(validityDate) < new Date();

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
                  <FileText className="h-4 w-4 text-primary-600" />
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
              <h1 className="text-3xl font-bold text-gray-900">Memorandum of Understanding</h1>
              <p className="text-gray-600 mt-2">
                {normalizedMOUs ? `${effectiveMOUs.length} MOU(s) from backend` : 'Manage and track all partnership agreements'}
              </p>
            </div>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add MOU</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search MOUs by title, organization, or strategic areas..."
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
                <option value="all">All MOUs</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* MOUs List */}
        <div className="space-y-6">
          {filteredMOUs.map((mou) => (
            <div key={mou.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{mou.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(mou.status)} flex items-center space-x-1`}>
                      {getStatusIcon(mou.status)}
                      <span>{mou.status}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{mou.organization}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>{mou.type}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {mou.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Signed: {new Date(mou.dateOfSigning).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span className={isExpired(mou.validity) ? 'text-red-600' : ''}>
                        Valid until: {new Date(mou.validity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button className="btn-primary text-sm">
                    View Details
                  </button>
                  <button className="btn-secondary text-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMOUs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No MOUs found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MOUsPage; 