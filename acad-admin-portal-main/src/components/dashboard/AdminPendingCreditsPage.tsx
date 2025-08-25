import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, ShieldAlert, RefreshCcw, User, Calendar, Award, Clock, FileText, ExternalLink, Download } from 'lucide-react';
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
  status?: string;
  createdAt: string;
  updatedAt: string;
  approveLink: string;
  declineLink: string;
}

const AdminPendingCreditsPage: React.FC = () => {
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
      
      // Call the ADMIN API endpoint (not BPRND POC API)
      const res = await fetch('http://localhost:3002/api/pending-credits', {
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

  const approve = async (creditId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Missing admin token');
      
      const res = await fetch(`http://localhost:3002/api/pending-credits/${creditId}/approve`, {
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
      
      toast({
        title: 'Success',
        description: 'Pending credit approved successfully',
      });
      
      // Refresh the list to get updated data
      fetchPendingCredits();
    } catch (error) {
      console.error('Error approving credit:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve credit',
        variant: 'destructive',
      });
    }
  };

  const decline = async (creditId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Missing admin token');
      
      const res = await fetch(`http://localhost:3002/api/pending-credits/${creditId}/decline`, {
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
      
      toast({
        title: 'Success',
        description: 'Pending credit declined successfully',
      });
      
      // Refresh the list to get updated data
      fetchPendingCredits();
    } catch (error) {
      console.error('Error declining credit:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to decline credit',
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

  const getStatusColor = (credit: PendingCredit) => {
    if (credit.bprnd_poc_approved && !credit.admin_approved) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusText = (credit: PendingCredit) => {
    if (credit.bprnd_poc_approved && !credit.admin_approved) {
      return 'Pending Admin Approval';
    }
    return 'Unknown Status';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCcw className="h-6 w-6 animate-spin" />
          <span>Loading pending credits...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Pending Credits</h1>
            <p className="text-gray-600 mt-1">
              Review and approve credits that have been approved by BPRND POC
            </p>
          </div>
        </div>
        <Button
          onClick={fetchPendingCredits}
          className="flex items-center space-x-2"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-700">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCredits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">POC Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingCredits.filter(c => c.bprnd_poc_approved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Admin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingCredits.filter(c => c.bprnd_poc_approved && !c.admin_approved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Credits List */}
      {pendingCredits.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ShieldCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending credits</h3>
              <p className="text-gray-600">
                All credits have been processed or there are no credits waiting for admin approval.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingCredits.map((credit) => (
            <Card key={credit._id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {credit.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Student ID: {credit.studentId?.Name || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(credit)}`}>
                          {getStatusText(credit)}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Organization</p>
                        <p className="text-sm text-gray-900">{credit.organization}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Discipline</p>
                        <p className="text-sm text-gray-900">{credit.discipline}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Total Hours</p>
                        <p className="text-sm text-gray-900">{credit.totalHours}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Calculated Credits</p>
                        <p className="text-sm text-gray-900">{credit.calculatedCredits}</p>
                      </div>
                    </div>

                    {/* Credit Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Theory</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{credit.theoryHours}h</span>
                          <span className="text-xs text-gray-500">({credit.theoryCredits} credits)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Practical</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{credit.practicalHours}h</span>
                          <span className="text-xs text-gray-500">({credit.practicalCredits} credits)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Duration</p>
                        <p className="text-sm text-gray-900">{credit.noOfDays} days</p>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {formatDate(credit.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Updated: {formatDate(credit.updatedAt)}</span>
                      </div>
                    </div>

                    {/* PDF Link */}
                    {credit.pdf && (
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <a
                          href={`http://localhost:3002/uploads/pdfs/${credit.pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                        >
                          <span>View PDF</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => decline(credit._id)}
                    className="flex items-center space-x-2"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Decline</span>
                  </Button>
                  <Button
                    onClick={() => approve(credit._id)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Approve</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPendingCreditsPage;
