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
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#0b2e63]">Pending Approval Requests</h1>
          <p className="text-black">Review and approve student certification requests awaiting POC approval</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={fetchClaims} disabled={loading} className="flex items-center gap-2">
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
          <CardTitle className="text-[#0b2e63]">Requests</CardTitle>
          <CardDescription className="text-gray-800">Total: {claims.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-black">Loading...</p>
          ) : claims.length === 0 ? (
            <p className="text-black">No requests found.</p>
          ) : (
            <div className="space-y-3">
              {claims.map((c) => (
                <div key={c._id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-black">{c.umbrellaKey.replace(/_/g, ' ')} — {c.qualification}</p>
                      <p className="text-base font-semibold text-black">Required: <span className="text-black font-bold">{c.requiredCredits}</span> credits | Status: <span className="text-black font-bold">{c.status}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => approve(c._id)} className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Approve
                      </Button>
                      <Button variant="destructive" onClick={() => decline(c._id)} className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" /> Decline
                      </Button>
                    </div>
                  </div>
                  
                  {/* Course Details */}
                  {c.courses && c.courses.length > 0 ? (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="text-base font-bold text-black mb-3">
                        Contributing Courses ({c.courses.length} courses, <span className="text-black">{c.courses.reduce((sum, course) => sum + course.creditsEarned, 0)}</span> total credits)
                      </h4>
                      <div className="space-y-2">
                        {c.courses.map((course, index) => (
                          <div key={index} className="p-3 bg-white rounded border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h5 className="text-base font-bold text-black">{course.name}</h5>
                                <p className="text-sm font-semibold text-black">Organization: <span className="text-black font-bold">{course.organization}</span></p>
                              </div>
                              <div className="text-right">
                                <p className="text-base font-bold text-black">{course.creditsEarned} credits</p>
                                <p className="text-sm font-semibold text-black">{course.totalHours} hours</p>
                              </div>
                            </div>
                            
                            {/* Detailed Credit Breakdown */}
                            <div className="mt-2 p-3 bg-blue-100 rounded text-sm">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-black font-semibold">Theory: <span className="font-bold">{course.theoryHours || 0}h</span> = <span className="font-bold text-black">{(course.theoryCredits || 0).toFixed(2)} cr</span></p>
                                  <p className="text-black font-semibold">Practical: <span className="font-bold">{course.practicalHours || 0}h</span> = <span className="font-bold text-black">{(course.practicalCredits || 0).toFixed(2)} cr</span></p>
                                </div>
                                <div>
                                  <p className="text-black font-semibold">Days: <span className="font-bold">{course.noOfDays || 0}</span></p>
                                  <p className="text-black font-semibold">Completed: <span className="font-bold">{new Date(course.completionDate).toLocaleDateString()}</span></p>
                                </div>
                              </div>
                            </div>
                            
                            {/* PDF Document Display */}
                            {course.pdfPath && (
                              <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                <h5 className="text-sm font-bold text-green-900 mb-2">Supporting Document</h5>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm text-black font-bold">
                                      {course.pdfFileName || 'Course Certificate'}
                                    </p>
                                    <p className="text-sm text-black font-semibold">
                                      PDF document uploaded with course submission
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-3 text-sm border-green-300 text-green-700 hover:bg-green-100 font-semibold"
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
                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm text-yellow-700">
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
