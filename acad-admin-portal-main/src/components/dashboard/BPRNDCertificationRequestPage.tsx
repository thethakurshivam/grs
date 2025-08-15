import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, ShieldAlert, RefreshCcw, User, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PendingCredit {
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
  totalHours: number;
  noOfDays: number;
  pdf: string;
  admin_approved: boolean;
  bprnd_poc_approved: boolean;
  createdAt: string;
  updatedAt: string;
  approveLink: string;
  declineLink: string;
}

const BPRNDCertificationRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingCredits, setPendingCredits] = useState<PendingCredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingCredits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Missing admin token');
      
      const res = await fetch('http://localhost:3000/api/pending-credits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }
      
      setPendingCredits(json.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pending credits');
      setPendingCredits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchPendingCredits(); 
  }, [fetchPendingCredits]);

  const approve = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Missing admin token');
      
      const res = await fetch(`http://localhost:3000/api/pending-credits/${id}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });
      
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }
      
      // Update the local state to reflect the approval
      setPendingCredits(prevCredits => 
        prevCredits.map(credit => 
          credit._id === id 
            ? { ...credit, admin_approved: true }
            : credit
        )
      );
      
      toast({
        title: 'Success',
        description: 'Credit request approved successfully',
      });
      
      // Refresh the list to get updated data
      fetchPendingCredits();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Approve failed';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const decline = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Missing admin token');
      
      const res = await fetch(`http://localhost:3000/api/pending-credits/${id}/decline`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });
      
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }
      
      // Update the local state to reflect the decline
      setPendingCredits(prevCredits => 
        prevCredits.map(credit => 
          credit._id === id 
            ? { ...credit, admin_approved: false }
            : credit
        )
      );
      
      toast({
        title: 'Success',
        description: 'Credit request declined successfully',
      });
      
      // Refresh the list to get updated data
      fetchPendingCredits();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Decline failed';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'admin_approved': return 'text-blue-600 bg-blue-50';
      case 'poc_approved': return 'text-green-600 bg-green-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'declined': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'admin_approved': return 'Admin Approved';
      case 'poc_approved': return 'POC Approved';
      case 'approved': return 'Fully Approved';
      case 'declined': return 'Declined';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-black">BPR&D Certification Request</h1>
          <p className="text-gray-700">Review and manage pending credit requests for BPR&D certifications</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={fetchPendingCredits} disabled={loading} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-red-600">{error}</CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Pending Credit Requests</CardTitle>
          <CardDescription>Total: {pendingCredits.length} requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCcw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading pending credits...</span>
            </div>
          ) : pendingCredits.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 text-lg">No pending credit requests found.</p>
              <p className="text-gray-500">All requests have been processed or there are no new submissions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCredits.map((credit) => (
                <div key={credit._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                                             <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2">
                           <User className="h-4 w-4 text-gray-500" />
                           <span className="font-medium text-gray-900">
                             {credit.studentId?.Name || credit.name || 'Unknown Student'}
                           </span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Calendar className="h-4 w-4 text-gray-500" />
                           <span className="text-sm text-gray-600">
                             {formatDate(credit.createdAt)}
                           </span>
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                         <div className="flex items-center gap-4">
                           <span className="text-lg font-semibold text-gray-900">
                             {credit.discipline}
                           </span>
                           <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                             {credit.organization}
                           </span>
                         </div>
                         
                         <div className="flex items-center gap-6 text-sm text-gray-600">
                           <span>Total Hours: <span className="font-semibold">{credit.totalHours}</span></span>
                           <span>Days: <span className="font-semibold">{credit.noOfDays}</span></span>
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(credit.admin_approved ? 'admin_approved' : 'pending')}`}>
                             {getStatusText(credit.admin_approved ? 'admin_approved' : 'pending')}
                           </span>
                         </div>
                       </div>
                    </div>
                    
                                         <div className="flex items-center gap-2 ml-4">
                       {!credit.admin_approved && (
                         <>
                           <Button 
                             variant="outline" 
                             onClick={() => approve(credit._id)} 
                             className="flex items-center gap-2 text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
                           >
                             <ShieldCheck className="h-4 w-4" /> Approve
                           </Button>
                           <Button 
                             variant="destructive" 
                             onClick={() => decline(credit._id)} 
                             className="flex items-center gap-2"
                           >
                             <ShieldAlert className="h-4 w-4" /> Decline
                           </Button>
                         </>
                       )}
                       {credit.admin_approved && !credit.bprnd_poc_approved && (
                         <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                           Awaiting POC Approval
                         </span>
                       )}
                       {credit.admin_approved && credit.bprnd_poc_approved && (
                         <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                           Fully Approved
                         </span>
                       )}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BPRNDCertificationRequestPage;
