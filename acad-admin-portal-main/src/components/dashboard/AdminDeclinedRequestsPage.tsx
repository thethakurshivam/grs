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
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

interface DeclinedRequest {
  id: string;
  studentId: string;
  name: string;
  organization: string;
  discipline: string;
  theoryHours: number;
  practicalHours: number;
  totalHours: number;
  calculatedCredits: number;
  noOfDays: number;
  pdf: string | null;
  pdfUrl: string | null;
  pdfExists: boolean;
  status: string;
  admin_approved: boolean;
  bprnd_poc_approved: boolean;
  createdAt: string;
  updatedAt: string;
  declinedBy: string;
  declinedAt: string;
}

const AdminDeclinedRequestsPage: React.FC = () => {
  const [declinedRequests, setDeclinedRequests] = useState<DeclinedRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeclinedRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Missing admin token');
      
      // Call the Admin API endpoint for declined requests
      const res = await fetch('http://localhost:3000/admin/declined-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `HTTP ${res.status}`);
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewDocument = (pdfUrl: string) => {
    if (pdfUrl) {
      // Use the pre-constructed URL from the API
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <ShieldAlert className="h-4 w-4 text-gray-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Declined Requests</h1>
            </div>
            <p className="text-gray-600">Review and manage requests that have been declined by admin</p>
          </div>
          <Button 
            onClick={fetchDeclinedRequests} 
            variant="outline" 
            className="flex items-center space-x-2 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors px-4 py-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Declined Requests</CardTitle>
          <CardDescription className="text-gray-600">
            Total: <span className="font-medium text-gray-900">{declinedRequests.length}</span> {loading && '(Loading...)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              <span className="ml-3 text-gray-600">Loading requests...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchDeclinedRequests} variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                Try Again
              </Button>
            </div>
          ) : declinedRequests.length === 0 ? (
            <div className="text-center py-12">
              <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Declined Requests</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There are no requests that have been declined by admin at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {declinedRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <XCircle className="w-4 h-4 text-gray-500" />
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        Declined by {request.declinedBy}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Declined: {formatDate(request.declinedAt)}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {request.discipline ? request.discipline.replace(/_/g, ' ') : 'Training Area'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{request.organization}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{request.totalHours} hours</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{request.calculatedCredits.toFixed(2)} credits</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span>Theory: {request.theoryHours}h</span>
                        <span>Practical: {request.practicalHours}h</span>
                        <span>Days: {request.noOfDays}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">Request Details</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Submitted:</span>
                          <span className="font-medium text-gray-900">{formatDate(request.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">POC Status:</span>
                          <span className={`font-medium ${request.bprnd_poc_approved ? 'text-green-600' : 'text-gray-600'}`}>
                            {request.bprnd_poc_approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Admin Status:</span>
                          <span className="font-medium text-gray-600">
                            Declined
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {request.pdf && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {request.pdfExists && request.pdfUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDocument(request.pdfUrl!)}
                          className="flex items-center space-x-2 text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Document</span>
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <FileText className="w-4 h-4" />
                          <span>Document not available</span>
                        </div>
                      )}
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

export default AdminDeclinedRequestsPage;
