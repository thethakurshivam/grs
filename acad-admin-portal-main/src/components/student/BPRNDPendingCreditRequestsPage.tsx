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
import { StudentDashboardLayout } from './StudentDashboardLayout';

interface PendingCreditRequest {
  id: string;
  studentId: string;
  name: string; // Course name from API
  organization: string;
  discipline: string; // Training area/course from API
  theoryHours: number;
  practicalHours: number;
  totalHours: number;
  calculatedCredits: number;
  noOfDays: number;
  pdf: string | null;
  status: string;
  admin_approved: boolean;
  bprnd_poc_approved: boolean;
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
      const res = await fetch(`/api/bprnd/pending-credits/student/${studentId}`);
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
      // The API returns a full URL, so we can use it directly
      window.open(documentPath, '_blank');
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div className="p-8 bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/50 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">My Pending Credit Requests</h1>
              </div>
              <p className="text-gray-600 text-lg">Track the status of your credit requests and their approval progress</p>
            </div>
            <Button 
              onClick={fetchPendingCreditRequests} 
              variant="outline" 
              className="flex items-center space-x-2 text-blue-700 font-semibold border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 px-6 py-3 rounded-xl"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

      <Card className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/50 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50 px-8 py-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Credit Requests</CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Total: <span className="font-semibold text-blue-600">{requests.length}</span> {loading && '(Loading...)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-black">Loading requests...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">Error</h3>
              <p className="text-black mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={fetchPendingCreditRequests} variant="outline" className="text-black font-semibold border-black hover:bg-gray-100">
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
                  className="text-black font-semibold border-black hover:bg-gray-100"
                >
                  Debug localStorage
                </Button>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">No Pending Credit Requests</h3>
              <p className="text-black max-w-md mx-auto">
                You haven't submitted any credit requests yet. Submit a new course to start earning credits.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200/50 rounded-xl bg-gradient-to-br from-white to-gray-50/50 hover:from-gray-50/50 hover:to-gray-100/50 hover:shadow-lg hover:border-gray-300/50 transition-all duration-300 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(request.status)}
                      <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}>
                        {request.status === 'pending' ? 'Pending' : request.status === 'approved' ? 'Approved' : request.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-black">
                      Submitted: {formatDate(request.createdAt)}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-[#1e3a8a]">
                          {request.discipline ? request.discipline.replace(/_/g, ' ') : 'Training Area'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-600" />
                        <span className="text-black">{request.organization}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-black" />
                          <span className="text-black">{request.totalHours} hours</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4 text-black" />
                          <span className="text-black">{request.calculatedCredits.toFixed(2)} credits</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-black">
                        <span>Theory: {request.theoryHours}h</span>
                        <span>Practical: {request.practicalHours}h</span>
                        <span>Days: {request.noOfDays}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-black text-sm">Approval Status</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-black">Submitted:</span>
                          <span className="font-medium text-black">{formatDate(request.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-black">POC Status:</span>
                          <span className={`font-medium ${request.bprnd_poc_approved ? 'text-black' : 'text-black'}`}>
                            {request.bprnd_poc_approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-black">Admin Status:</span>
                          <span className={`font-medium ${request.admin_approved ? 'text-black' : 'text-black'}`}>
                            {request.admin_approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {request.pdf && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDocument(request.pdf!)}
                        className="flex items-center space-x-2 text-xs text-black font-semibold border-black hover:bg-gray-100"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Document</span>
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
    </StudentDashboardLayout>
  );
};

export default BPRNDPendingCreditRequestsPage;
