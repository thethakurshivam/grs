import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar,
  User,
  Building,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingCreditRequest {
  _id: string;
  studentId: string;
  courseName: string;
  organization: string;
  hours: number;
  credits: number;
  completionDate: string;
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
  createdAt: string;
  updatedAt: string;
}

const BPRNDPendingCreditRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PendingCreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PendingCreditRequest | null>(null);

  useEffect(() => {
    fetchPendingCreditRequests();
  }, []);

  const fetchPendingCreditRequests = async () => {
    try {
      setLoading(true);
      
      // Use the same logic as BPRNDStudentDashboard to get student ID
      const storedBprnd = localStorage.getItem('bprndStudentData');
      let derivedId: string | null = null;
      try {
        if (storedBprnd) {
          const parsed = JSON.parse(storedBprnd);
          derivedId = parsed?._id || null;
        }
      } catch (_) {
        // ignore JSON parse errors
      }
      const studentId = derivedId || localStorage.getItem('bprndStudentId') || localStorage.getItem('studentId');
      
      if (!studentId) {
        setError('Student ID not found. Please log in again.');
        console.error('No student ID available');
        console.log('Available localStorage keys:', Object.keys(localStorage));
        console.log('bprndStudentData:', localStorage.getItem('bprndStudentData'));
        console.log('bprndStudentId:', localStorage.getItem('bprndStudentId'));
        console.log('studentId:', localStorage.getItem('studentId'));
        return;
      }

      const response = await fetch(`http://localhost:3004/student/${studentId}/pending-credits`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      } else {
        setError(data.message || 'Failed to fetch pending credit requests');
        toast.error('Failed to fetch pending credit requests');
      }
    } catch (error) {
      console.error('Error fetching pending credit requests:', error);
      setError('Network error occurred');
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending credit requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
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
              className="ml-2"
            >
              Debug localStorage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Credit Requests</h1>
          <p className="text-gray-600 mt-2">
            Track the status of your credit requests and their approval progress
          </p>
        </div>
        <Button onClick={fetchPendingCreditRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Credit Requests</h3>
            <p className="text-gray-600 text-center max-w-md">
              You haven't submitted any credit requests yet. Submit a new course to start earning credits.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <Badge className={request.statusColor}>
                        {request.statusLabel}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted: {request.formattedCreatedAt}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{request.courseName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{request.organization}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span>{request.hours} hours</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-green-600" />
                        <span>{request.credits} credits</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Completed: {formatDate(request.completionDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Approval Timeline</h4>
                    <div className="space-y-2 text-sm">
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
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          <strong>Reason:</strong> {request.declined_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {request.supportingDocument && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewDocument(request.supportingDocument!)}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Supporting Document</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BPRNDPendingCreditRequestsPage;
