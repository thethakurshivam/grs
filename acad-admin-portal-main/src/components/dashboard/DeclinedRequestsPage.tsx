import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldAlert, RefreshCcw, User, Calendar, Clock, FileText, ExternalLink, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DeclinedRequest {
  _id: string;
  studentId: {
    _id: string;
    Name: string;
    email: string;
    Designation: string;
    State: string;
  };
  name: string;
  organization: string;
  discipline: string;
  theoryHours: number;
  practicalHours: number;
  theoryCredits: number;
  practicalCredits: number;
  totalHours: number;
  calculatedCredits: number;
  noOfDays: number;
  pdf: string;
  admin_approved: boolean;
  bprnd_poc_approved: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  declined_at?: string;
  declined_reason?: string;
}

const DeclinedRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [declinedRequests, setDeclinedRequests] = useState<DeclinedRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'poc' | 'admin'>('all');

  const fetchDeclinedRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('pocToken');
      if (!token) throw new Error('Missing POC token');
      
      // Call the BPRND POC API endpoint for declined requests
      const res = await fetch('http://localhost:3003/api/bprnd/poc/declined-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }
      
      setDeclinedRequests(json.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load declined requests');
      setDeclinedRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchDeclinedRequests(); 
  }, [fetchDeclinedRequests]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter requests based on selected filter type
  const filteredRequests = declinedRequests.filter(request => {
    if (filterType === 'all') return true;
    if (filterType === 'poc') return request.status === 'poc_declined';
    if (filterType === 'admin') return request.status === 'admin_declined';
    return true;
  });

  // Get counts for each type
  const pocDeclinedCount = declinedRequests.filter(r => r.status === 'poc_declined').length;
  const adminDeclinedCount = declinedRequests.filter(r => r.status === 'admin_declined').length;
  const totalDeclinedCount = declinedRequests.length;

  const getStatusColor = (request: DeclinedRequest) => {
    if (request.status === 'poc_declined') {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (request.status === 'admin_declined') {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusText = (request: DeclinedRequest) => {
    if (request.status === 'poc_declined') {
      return 'Declined by POC';
    } else if (request.status === 'admin_declined') {
      return 'Declined by Admin';
    }
    return 'Unknown Status';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCcw className="h-6 w-6 animate-spin" />
          <span>Loading declined requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <Button
              onClick={fetchDeclinedRequests}
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-semibold text-gray-900">Declined Requests</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and review declined credit requests
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <ShieldAlert className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Filter requests</span>
            </div>
            <div className="flex space-x-1">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="text-xs px-3 py-1.5 h-8"
              >
                All ({totalDeclinedCount})
              </Button>
              <Button
                variant={filterType === 'poc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('poc')}
                className="text-xs px-3 py-1.5 h-8"
              >
                POC ({pocDeclinedCount})
              </Button>
              <Button
                variant={filterType === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('admin')}
                className="text-xs px-3 py-1.5 h-8"
              >
                Admin ({adminDeclinedCount})
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{totalDeclinedCount}</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">POC Declined</p>
                <p className="text-2xl font-semibold text-gray-900">{pocDeclinedCount}</p>
              </div>
              <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admin Declined</p>
                <p className="text-2xl font-semibold text-gray-900">{adminDeclinedCount}</p>
              </div>
              <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Declined Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center py-12">
              <ShieldAlert className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {filterType === 'all' ? 'No Declined Requests' : 
                 filterType === 'poc' ? 'No POC Declined Requests' : 
                 'No Admin Declined Requests'}
              </h3>
              <p className="text-sm text-gray-500">
                {filterType === 'all' ? 'There are no declined credit requests at the moment.' :
                 filterType === 'poc' ? 'There are no credit requests declined by POC at the moment.' :
                 'There are no credit requests declined by Admin at the moment.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {request.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {request.studentId?.Name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request)}`}>
                        {getStatusText(request)}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Organization</p>
                      <p className="text-sm text-gray-900 font-medium">{request.organization}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Discipline</p>
                      <p className="text-sm text-gray-900 font-medium">{request.discipline}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Hours</p>
                      <p className="text-sm text-gray-900 font-medium">{request.totalHours}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Credits</p>
                      <p className="text-sm text-gray-900 font-medium">{request.calculatedCredits}</p>
                    </div>
                  </div>

                  {/* Credit Breakdown */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Theory</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-900">{request.theoryHours}h</span>
                        <span className="text-xs text-gray-500">({request.theoryCredits})</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Practical</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-900">{request.practicalHours}h</span>
                        <span className="text-xs text-gray-500">({request.practicalCredits})</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                      <p className="text-sm font-medium text-gray-900">{request.noOfDays} days</p>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="flex items-center space-x-6 text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created {formatDate(request.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Updated {formatDate(request.updatedAt)}</span>
                    </div>
                    {request.declined_at && (
                      <div className="flex items-center space-x-1">
                        <ShieldAlert className="h-3 w-3" />
                        <span>Declined {formatDate(request.declined_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Decline Reason */}
                  {request.declined_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Decline Reason</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1 ml-5">{request.declined_reason}</p>
                    </div>
                  )}

                  {/* PDF Link */}
                  {request.pdf && (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-3 w-3 text-gray-400" />
                      <a
                        href={`http://localhost:3003/files/${request.pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1"
                      >
                        <span>View PDF</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeclinedRequestsPage;
