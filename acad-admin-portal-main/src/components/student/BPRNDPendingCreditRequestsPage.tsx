import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar,
  Building,
  Award,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingCreditRequest {
  _id: string;
  studentId: string;
  name?: string; // Course name from API
  courseName?: string; // Alternative field name
  organization: string;
  totalHours?: number; // Hours from API
  hours?: number; // Alternative field name
  credits?: number;
  completionDate?: string;
  discipline?: string; // Umbrella/discipline from API
  umbrellaKey?: string; // Alternative field name
  status: string;
  statusLabel: string;
  statusColor: string;
  formattedCreatedAt: string;
  formattedPocApprovedAt?: string;
  formattedAdminApprovedAt?: string;
  formattedDeclinedAt?: string;
  poc_approved_at?: string;
  admin_approved_at?: string;
  declined_at?: string;
  declined_reason?: string;
  supportingDocument?: string;
  pdf?: string; // PDF path from API
  createdAt: string;
  updatedAt: string;
}

const BPRNDPendingCreditRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PendingCreditRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentId = (() => {
    const b = localStorage.getItem('bprndStudentData');
    try { if (b) { const p = JSON.parse(b); if (p?._id) return p._id as string; } } catch {}
    return localStorage.getItem('bprndStudentId') || localStorage.getItem('studentId') || '';
  })();

  const fetchPendingCreditRequests = useCallback(async () => {
    try {
      if (!studentId) throw new Error('Missing studentId');
      setLoading(true);
      setError(null);
      const res = await fetch(`http://localhost:3004/student/${encodeURIComponent(studentId)}/pending-credits`);
      const json = await res.json();
      if (!res.ok || json?.success === false) throw new Error(json?.message || `HTTP ${res.status}`);
      setRequests(json.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pending credit requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetchPendingCreditRequests(); }, [fetchPendingCreditRequests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'poc_approved':
      case 'admin_approved':
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewDocument = (documentPath: string) => {
    if (documentPath) {
      window.open(`http://localhost:3004/files/${documentPath}`, '_blank');
    }
  };

  return (
    <div className="space-y-6 m-6">
      <div className="p-6 bg-white border border-blue-200 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a8a]">My Pending Credit Requests</h1>
            <p className="text-gray-700">Track the status of your credit requests and their approval progress</p>
          </div>
          <Button 
            onClick={fetchPendingCreditRequests} 
            variant="outline" 
            className="flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <Card className="bg-white border border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#1e3a8a]">Credit Requests</CardTitle>
          <CardDescription className="text-gray-600">
            Total: {requests.length} {loading && '(Loading...)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-700">Loading requests...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={fetchPendingCreditRequests} variant="outline">
                  Try Again
                </Button>
                <Button 
                  onClick={() => {
                    console.log('=== DEBUG: localStorage contents ===');
                    console.log('All keys:', Object.keys(localStorage));
                    console.log('bprndStudentData:', localStorage.getItem('bprndStudentData'));
                    console.log('bprndStudentId:', localStorage.getItem('bprndStudentId'));
                    console.log('studentId:', localStorage.getItem('studentId'));
                    alert('Check browser console for localStorage debug info');
                  }} 
                  variant="outline"
                >
                  Debug localStorage
                </Button>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Credit Requests</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You haven't submitted any credit requests yet. Submit a new course to start earning credits.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="border border-blue-200 rounded-lg bg-blue-50/30 hover:bg-blue-50/50 transition-colors p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(request.status)}
                      <Badge className={request.statusColor}>
                        {request.statusLabel}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      Submitted: {request.formattedCreatedAt}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-[#1e3a8a]">
                          {request.name || request.courseName || 'Course Name'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{request.organization}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span>{request.totalHours || request.hours || 0} hours</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4 text-green-600" />
                          <span>{request.credits || 0} credits</span>
                        </div>
                      </div>
                      
                      {request.discipline && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            Discipline: {request.discipline.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">Approval Timeline</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Submitted:</span>
                          <span className="font-medium">{request.formattedCreatedAt}</span>
                        </div>
                        
                        {request.formattedPocApprovedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600">POC Approved:</span>
                            <span className="font-medium">{request.formattedPocApprovedAt}</span>
                          </div>
                        )}
                        
                        {request.formattedAdminApprovedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-green-600">Admin Approved:</span>
                            <span className="font-medium">{request.formattedAdminApprovedAt}</span>
                          </div>
                        )}
                        
                        {request.formattedDeclinedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-red-600">Declined:</span>
                            <span className="font-medium">{request.formattedDeclinedAt}</span>
                          </div>
                        )}
                      </div>
                      
                      {request.declined_reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                          <p className="text-red-800">
                            <strong>Reason:</strong> {request.declined_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(request.supportingDocument || request.pdf) && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDocument(request.pdf || request.supportingDocument!)}
                        className="flex items-center space-x-2 text-xs"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View Supporting Document</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BPRNDPendingCreditRequestsPage;
