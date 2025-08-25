import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, ShieldAlert, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Claim {
  _id: string;
  studentId: string;
  umbrellaKey: string;
  qualification: 'certificate' | 'diploma' | 'pg diploma';
  requiredCredits: number;
  status: 'pending' | 'admin_approved' | 'poc_approved' | 'approved' | 'declined';
  createdAt: string;
  updatedAt: string;
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
}

const POCBPRNDClaimsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:3003/api/bprnd/claims', {
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok || json?.success === false) throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      
      // Backend now filters to show only claims needing POC approval
      setClaims(json.data || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const approve = async (id: string) => {
    try {
      console.log('🔍 Approving claim:', id);
      const res = await fetch(`http://localhost:3003/api/bprnd/claims/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('📡 Response status:', res.status);
      const json = await res.json().catch(() => ({}));
      console.log('📡 Response data:', json);
      
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }
      
      console.log('✅ Claim approved successfully');
      
      // Remove the approved claim from the local state immediately
      setClaims(prevClaims => prevClaims.filter(claim => claim._id !== id));
      
      // Show success toast
      toast({
        title: 'Claim Approved!',
        description: 'The certification claim has been approved and is now waiting for admin approval.',
        variant: 'default',
      });
      
      // Clear any previous errors
      setError(null);
    } catch (e) {
      console.error('❌ Approve failed:', e);
      setError(e instanceof Error ? e.message : 'Approve failed');
    }
  };

  const decline = async (id: string) => {
    try {
      console.log('🔍 Declining claim:', id);
      const res = await fetch(`http://localhost:3003/api/bprnd/claims/${id}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Declined by POC' })
      });
      
      console.log('📡 Response status:', res.status);
      const json = await res.json().catch(() => ({}));
      console.log('📡 Response data:', json);
      
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }
      
      console.log('✅ Claim declined successfully');
      
      // Remove the declined claim from the local state immediately
      setClaims(prevClaims => prevClaims.filter(claim => claim._id !== id));
      
      // Show success toast
      toast({
        title: 'Claim Declined!',
        description: 'The certification claim has been declined.',
        variant: 'default',
      });
      
      // Clear any previous errors
      setError(null);
    } catch (e) {
      console.error('❌ Decline failed:', e);
      setError(e instanceof Error ? e.message : 'Decline failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/poc-portal')} className="hover:bg-accent">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pending Approval Requests</h1>
          <p className="text-sm text-gray-600">Review and approve student certification requests awaiting POC approval</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={fetchClaims} disabled={loading} className="flex items-center gap-2 text-sm">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-600 text-sm">{error}</CardContent>
        </Card>
      )}

      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Requests
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">Total: {claims.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600 text-sm">Loading...</p>
          ) : claims.length === 0 ? (
            <p className="text-gray-600 text-sm">No requests found.</p>
          ) : (
            <div className="space-y-3">
              {claims.map((c) => (
                <div key={c._id} className="p-5 border border-gray-200 rounded-xl space-y-4 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-1">{c.umbrellaKey.replace(/_/g, ' ')} — {c.qualification}</p>
                      <p className="text-sm font-medium text-gray-600">Required: <span className="font-semibold text-gray-800">{c.requiredCredits}</span> credits | Status: <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                        c.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        c.status === 'poc_approved' ? 'bg-blue-100 text-blue-800' :
                        c.status === 'admin_approved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{c.status}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => approve(c._id)} className="flex items-center gap-2 text-sm h-9 px-4 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-colors">
                        <ShieldCheck className="h-4 w-4" /> Approve
                      </Button>
                      <Button variant="destructive" onClick={() => decline(c._id)} className="flex items-center gap-2 text-sm h-9 px-4 hover:bg-red-600 transition-colors">
                        <ShieldAlert className="h-4 w-4" /> Decline
                      </Button>
                    </div>
                  </div>
                  
                  {/* Course Details */}
                  {c.courses && c.courses.length > 0 ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Contributing Courses ({c.courses.length} courses, <span className="font-semibold text-blue-700">{c.courses.reduce((sum, course) => sum + course.creditsEarned, 0)}</span> total credits)
                      </h4>
                      <div className="space-y-3">
                        {c.courses.map((course, index) => (
                          <div key={index} className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-1">{course.name}</h5>
                                <p className="text-xs font-medium text-gray-600">Organization: <span className="font-semibold text-gray-700">{course.organization}</span></p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{course.creditsEarned} credits</p>
                                <p className="text-xs font-medium text-gray-600">{course.totalHours} hours</p>
                              </div>
                            </div>
                            
                            {/* Detailed Credit Breakdown */}
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg text-xs border border-blue-200">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-gray-700 font-medium mb-1">Theory: <span className="font-semibold text-gray-800">{course.theoryHours || 0}h</span> = <span className="font-semibold text-blue-700">{(course.theoryCredits || 0).toFixed(2)} cr</span></p>
                                  <p className="text-gray-700 font-medium">Practical: <span className="font-semibold text-gray-800">{course.practicalHours || 0}h</span> = <span className="font-semibold text-blue-700">{(course.practicalCredits || 0).toFixed(2)} cr</span></p>
                                </div>
                                <div>
                                  <p className="text-gray-700 font-medium mb-1">Days: <span className="font-semibold text-gray-800">{course.noOfDays || 0}</span></p>
                                  <p className="text-gray-700 font-medium">Completed: <span className="font-semibold text-gray-800">{new Date(course.completionDate).toLocaleDateString()}</span></p>
                                </div>
                              </div>
                            </div>
                            
                            {/* PDF Document Display */}
                            {course.pdfPath && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                <h5 className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Supporting Document
                                </h5>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-900">
                                      {course.pdfFileName || 'Course Certificate'}
                                    </p>
                                    <p className="text-xs font-medium text-gray-600">
                                      PDF document uploaded with course submission
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-3 text-xs border-green-300 text-green-700 hover:bg-green-100 font-medium transition-colors"
                                    onClick={() => window.open(course.pdfPath, '_blank')}
                                  >
                                    View PDF
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <strong>No course details available.</strong> This claim was created before course tracking was implemented.
                      </p>
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

export default POCBPRNDClaimsPage;
