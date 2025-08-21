import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, ShieldAlert, RefreshCcw, User, Calendar, Award, Clock } from 'lucide-react';
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

const BPRNDPendingCreditsPage: React.FC = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-6 w-6 animate-spin" />
          <span>Loading pending credits...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchPendingCredits} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-black font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-black">BPR&D Pending Credits</h1>
          <p className="text-black">Manage BPRND pending credit requests and approvals</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-black">Total Requests</p>
                <p className="text-2xl font-bold text-black">{pendingCredits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-black">Pending</p>
                <p className="text-2xl font-bold text-black">{pendingCredits.filter(c => !c.admin_approved).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-black">Admin Approved</p>
                <p className="text-2xl font-bold text-black">{pendingCredits.filter(c => c.admin_approved).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-black">Fully Approved</p>
                <p className="text-2xl font-bold text-black">{pendingCredits.filter(c => c.admin_approved && c.bprnd_poc_approved).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Credits List */}
      {pendingCredits.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No Pending Credits Found</h3>
            <p className="text-black">There are currently no pending credit requests to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingCredits.map((credit) => (
            <Card key={credit._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="text-xl font-bold text-black">
                          {credit.name}
                        </h3>
                        <p className="text-base font-semibold text-black">
                          Student: <span className="text-black font-bold">{credit.studentId?.Name || 'Unknown'}</span> (<span className="text-black font-semibold">{credit.studentId?.email || 'No email'}</span>)
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="text-base font-semibold text-black">Discipline: <span className="text-black font-bold">{credit.discipline}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="text-base font-semibold text-black">Days: <span className="text-black font-bold">{credit.noOfDays}</span></span>
                      </div>
                    </div>

                    {/* Detailed Hours and Credits Breakdown */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-lg font-bold text-black mb-3">Credit Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-base">
                            <span className="text-black font-semibold">Theory Hours:</span>
                            <span className="font-bold text-black">{credit.theoryHours || 0}h</span>
                          </div>
                          <div className="flex justify-between text-base">
                            <span className="text-black font-semibold">Theory Credits:</span>
                            <span className="font-bold text-black">{(credit.theoryCredits || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-base">
                            <span className="text-black font-semibold">Practical Hours:</span>
                            <span className="font-bold text-black">{credit.practicalHours || 0}h</span>
                          </div>
                          <div className="flex justify-between text-base">
                            <span className="text-black font-semibold">Practical Credits:</span>
                            <span className="font-bold text-black">{(credit.practicalCredits || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex justify-between text-base font-semibold">
                          <span className="text-black">Total Hours:</span>
                          <span className="font-bold text-black">{credit.totalHours || 0}h</span>
                        </div>
                        <div className="flex justify-between text-base font-semibold">
                          <span className="text-black">Total Credits:</span>
                          <span className="font-bold text-black">{(credit.calculatedCredits || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-base font-semibold text-black">
                        <span className="font-bold text-black">Organization:</span> {credit.organization}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-base font-bold ${
                        credit.admin_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {credit.admin_approved ? 'Admin Approved' : 'Pending Admin Approval'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
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
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <Button onClick={fetchPendingCredits} variant="outline" className="flex items-center gap-2 mx-auto text-black font-semibold">
          <RefreshCcw className="h-4 w-4" />
          Refresh Pending Credits
        </Button>
      </div>
    </div>
  );
};

export default BPRNDPendingCreditsPage;
