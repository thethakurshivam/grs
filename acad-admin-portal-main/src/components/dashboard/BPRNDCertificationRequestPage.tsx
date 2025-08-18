import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, ShieldAlert, RefreshCcw, User, Calendar, Award, FileText, Eye, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface BPRNDClaim {
  _id: string;
  studentId: string;
  umbrellaKey: string;
  qualification: 'certificate' | 'diploma' | 'pg diploma';
  requiredCredits: number;
  status: 'pending' | 'admin_approved' | 'poc_approved' | 'approved' | 'declined';
  
  // New approval fields
  poc_approved?: boolean;
  poc_approved_at?: string;
  poc_approved_by?: string;
  admin_approved?: boolean;
  admin_approved_at?: string;
  admin_approved_by?: string;
  
  // Legacy approval fields (keeping for backward compatibility)
  adminApproval?: {
    by?: string;
    at?: string;
    decision?: 'approved' | 'declined';
  };
  pocApproval?: {
    by?: string;
    at?: string;
    decision?: 'approved' | 'declined';
  };
  
  notes?: string;
  courses?: Array<{
    courseName: string;
    organization: string;
    hoursEarned: number;
    creditsEarned: number;
    completionDate: string;
    courseId: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const BPRNDCertificationRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [claims, setClaims] = useState<BPRNDClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Missing admin token');
      
      const res = await fetch('http://localhost:3000/api/bprnd/claims', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }
      
      console.log('🔍 Admin claims response:', json);
      console.log('📊 Claims data:', json.data);
      
      setClaims(json.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load BPRND claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchClaims(); 
  }, [fetchClaims]);

  const approve = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Missing admin token');
      
      const res = await fetch(`http://localhost:3000/api/bprnd/claims/${id}/approve`, {
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
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim._id === id 
            ? { ...claim, status: 'admin_approved' as const }
            : claim
        )
      );
      
      toast({
        title: 'Success',
        description: 'BPRND claim approved successfully',
      });
      
      // Refresh the list to get updated data
      fetchClaims();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Approve failed';
      console.error('Approve error:', e);
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
      
      const res = await fetch(`http://localhost:3000/api/bprnd/claims/${id}/decline`, {
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
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim._id === id 
            ? { ...claim, status: 'declined' as const }
            : claim
        )
      );
      
      toast({
        title: 'Success',
        description: 'BPRND claim declined successfully',
      });
      
      // Refresh the list to get updated data
      fetchClaims();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Decline failed';
      console.error('Decline error:', e);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin_approved':
        return 'bg-blue-100 text-blue-800';
      case 'poc_approved':
        return 'bg-purple-100 text-purple-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'admin_approved':
        return 'Admin Approved';
      case 'poc_approved':
        return 'POC Approved';
      case 'approved':
        return 'Approved';
      case 'declined':
        return 'Declined';
      default:
        return 'Unknown';
    }
  };

  const getQualificationText = (qualification: string) => {
    switch (qualification) {
      case 'certificate':
        return 'Certificate';
      case 'diploma':
        return 'Diploma';
      case 'pg diploma':
        return 'PG Diploma';
      default:
        return qualification;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-6 w-6 animate-spin" />
          <span>Loading BPRND claims...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchClaims} variant="outline">
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
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BPR&D Certification Request</h1>
          <p className="text-gray-600">Review and approve BPRND certification claims</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold">{claims.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{claims.filter(c => c.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{claims.filter(c => c.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Declined</p>
                <p className="text-2xl font-bold">{claims.filter(c => c.status === 'declined').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No BPRND Claims Found</h3>
            <p className="text-gray-600">There are currently no BPRND certification claims to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {claim.umbrellaKey.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Student ID: {claim.studentId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Qualification: <span className="font-semibold">{getQualificationText(claim.qualification)}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>Required Credits: <span className="font-semibold">{claim.requiredCredits}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Created: <span className="text-sm font-semibold">{new Date(claim.createdAt).toLocaleDateString()}</span></span>
                      </div>
                    </div>

                    {claim.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {claim.notes}
                        </p>
                      </div>
                    )}

                    {/* Course Details Section */}
                    {claim.courses && claim.courses.length > 0 ? (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            Contributing Courses ({claim.courses.length} courses, {claim.courses.reduce((sum, course) => sum + course.creditsEarned, 0)} total credits)
                          </span>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="space-y-3">
                            {claim.courses.map((course, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-blue-200">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{course.courseName}</h4>
                                  <p className="text-sm text-gray-600">{course.organization}</p>
                                  <p className="text-xs text-gray-500">
                                    Completed: {new Date(course.completionDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-blue-600">
                                    {course.creditsEarned} credits
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {course.hoursEarned} hours
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              <strong>No course details available.</strong> This claim was created before course tracking was implemented.
                            </p>
                            <p className="text-sm text-yellow-600 mt-1">
                              Course details: {JSON.stringify(claim.courses)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                        {getStatusText(claim.status)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    {/* Show approve/decline buttons for POC-approved claims that admin can review */}
                    {(claim.status === 'poc_approved' || (claim.poc_approved && !claim.admin_approved)) && (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => approve(claim._id)} 
                          className="flex items-center gap-2 text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
                        >
                          <ShieldCheck className="h-4 w-4" /> Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => decline(claim._id)} 
                          className="flex items-center gap-2"
                        >
                          <ShieldAlert className="h-4 w-4" /> Decline
                        </Button>
                      </>
                    )}
                    
                    {/* Show status for other claim states */}
                    {claim.status === 'pending' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Awaiting POC Approval
                      </span>
                    )}
                    {claim.status === 'approved' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Fully Approved
                      </span>
                    )}
                    {claim.status === 'declined' && (
                      <span className="px-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Declined
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
        <Button onClick={fetchClaims} variant="outline" className="flex items-center gap-2 mx-auto">
          <RefreshCcw className="h-4 w-4" />
          Refresh Claims
        </Button>
      </div>
    </div>
  );
};

export default BPRNDCertificationRequestPage;
