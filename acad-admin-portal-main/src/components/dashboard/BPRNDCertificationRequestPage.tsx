import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, ShieldAlert, RefreshCcw, User, Calendar, Award, Eye, CheckCircle, XCircle } from 'lucide-react';
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
    _id: string;
    name: string;
    organization: string;
    discipline: string;
    theoryHours: number;
    practicalHours: number;
    theoryCredits: number;
    practicalCredits: number;
    totalHours: number;
    creditsEarned: number;
    noOfDays: number;
    completionDate: string;
    courseId: string;
    // Add PDF information
    pdfPath?: string;
    pdfFileName?: string;
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
      
      const res = await fetch('http://localhost:3000/admin/bprnd/claims', {
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
      
      const res = await fetch(`http://localhost:3000/admin/bprnd/claims/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }
      
      toast({
        title: "Claim Approved",
        description: "BPRND certification claim has been approved successfully.",
      });
      
      fetchClaims(); // Refresh the list
    } catch (e) {
      toast({
        title: "Approval Failed",
        description: e instanceof Error ? e.message : "Failed to approve claim",
        variant: "destructive",
      });
    }
  };

  const decline = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Missing admin token');
      
      const res = await fetch(`http://localhost:3000/admin/bprnd/claims/${id}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }
      
      toast({
        title: "Claim Declined",
        description: "BPRND certification claim has been declined.",
      });
      
      fetchClaims(); // Refresh the list
    } catch (e) {
      toast({
        title: "Decline Failed",
        description: e instanceof Error ? e.message : "Failed to decline claim",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, pocApproved?: boolean, adminApproved?: boolean) => {
    if (adminApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    } else if (pocApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <ShieldCheck className="w-3 h-3 mr-1" />
          POC Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ShieldAlert className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading certification claims...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ShieldAlert className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchClaims} variant="outline">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">BPRND Certification Requests</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Review and manage certification claims from BPRND students
                </p>
              </div>
            </div>
            <Button
              onClick={fetchClaims}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {claims.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-600">
                There are currently no BPRND certification claims to review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <Card key={claim._id} className="bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                <CardContent className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {claim.umbrellaKey.replace(/_/g, ' ')}
                        </h3>
                        {getStatusBadge(claim.status, claim.poc_approved, claim.admin_approved)}
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {claim.qualification.charAt(0).toUpperCase() + claim.qualification.slice(1)}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(claim.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          Student ID: {claim.studentId.slice(-8)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {!claim.admin_approved && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => approve(claim._id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => decline(claim._id)}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Course Details */}
                  {claim.courses && claim.courses.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Course Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {claim.courses.map((course, index) => (
                          <div key={course._id} className="bg-white rounded-md p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 text-sm">{course.name}</h5>
                              <span className="text-xs text-gray-500">{course.organization}</span>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex justify-between">
                                <span>Theory:</span>
                                <span>{course.theoryCredits.toFixed(2)} credits</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Practical:</span>
                                <span>{course.practicalCredits.toFixed(2)} credits</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Total:</span>
                                <span>{course.creditsEarned.toFixed(2)} credits</span>
                              </div>
                            </div>
                            {course.pdfPath && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 text-xs text-blue-600 hover:text-blue-700"
                                onClick={() => window.open(course.pdfPath, '_blank')}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Certificate
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Required Credits:</span>
                      <span className="font-medium text-gray-900">{claim.requiredCredits}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Earned:</span>
                      <span className="font-medium text-gray-900">
                        {claim.courses?.reduce((sum, course) => sum + course.creditsEarned, 0) || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BPRNDCertificationRequestPage;
