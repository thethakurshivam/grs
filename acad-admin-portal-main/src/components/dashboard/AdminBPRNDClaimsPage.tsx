import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, ShieldAlert, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Course {
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
  createdAt: string;
}

interface Claim {
  _id: string;
  studentId: string;
  umbrellaKey: string;
  qualification: 'certificate' | 'diploma' | 'pg diploma';
  requiredCredits: number;
  status: 'pending' | 'poc_approved' | 'admin_approved' | 'approved' | 'poc_declined' | 'admin_declined';
  createdAt: string;
  updatedAt: string;
  adminApproval?: { by?: string; at?: string; decision?: string };
  pocApproval?: { by?: string; at?: string; decision?: string };
  courses: Course[];
  courseCount: number;
  totalCreditsFromCourses: number;
  umbrellaLabel: string;
}

const AdminBPRNDClaimsPage: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
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
      if (!res.ok || json?.success === false) throw new Error(json?.error || `HTTP ${res.status}`);
      setClaims(json.data || []);
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
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Missing admin token');
      const res = await fetch(`http://localhost:3000/admin/bprnd/claims/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) throw new Error(json?.error || `HTTP ${res.status}`);
      
      // Remove the approved claim from the local state immediately
      setClaims(prevClaims => prevClaims.filter(claim => claim._id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
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
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) throw new Error(json?.error || `HTTP ${res.status}`);
      
      // Remove the declined claim from the local state immediately
      setClaims(prevClaims => prevClaims.filter(claim => claim._id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Decline failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-black">Pending Admin Approval</h1>
          <p className="text-gray-700">Review and approve student certification requests awaiting admin approval</p>
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
          <CardTitle>Requests</CardTitle>
          <CardDescription>Total: {claims.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-700">Loading...</p>
          ) : claims.length === 0 ? (
            <p className="text-gray-700">No requests found.</p>
          ) : (
            <div className="space-y-4">
              {claims.map((c) => (
                <div key={c._id} className="border rounded-lg overflow-hidden">
                  {/* Claim Header */}
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-black">{c.umbrellaLabel} — {c.qualification}</h3>
                        <div className="text-sm text-gray-700 space-y-1 mt-1">
                          <p>Required Credits: {c.requiredCredits} | Available: {c.totalCreditsFromCourses.toFixed(2)}</p>
                          <p>Status: <span className={`font-medium ${
                          c.status === 'pending' ? 'text-yellow-600' : 
                          c.status === 'poc_approved' ? 'text-blue-600' : 
                          c.status === 'admin_approved' ? 'text-green-600' : 
                          c.status === 'approved' ? 'text-green-600' : 
                          c.status === 'poc_declined' ? 'text-red-600' : 
                          c.status === 'admin_declined' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>{c.status}</span></p>
                          <p>Course Count: {c.courseCount} courses</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => approve(c._id)} className="flex items-center gap-2 text-gray-900 font-semibold">
                          <ShieldCheck className="h-4 w-4" /> Approve
                        </Button>
                        <Button variant="destructive" onClick={() => decline(c._id)} className="flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4" /> Decline
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Course Details */}
                  {c.courses && c.courses.length > 0 && (
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Contributing Courses:</h4>
                      <div className="space-y-3">
                        {c.courses.map((course, index) => (
                          <div key={course._id} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{course.name}</h5>
                                <p className="text-sm text-gray-600">{course.organization} • {course.discipline}</p>
                                
                                {/* Credit Breakdown */}
                                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Theory:</span>
                                      <span className="font-medium">{course.theoryHours}h = {course.theoryCredits.toFixed(2)} credits</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Practical:</span>
                                      <span className="font-medium">{course.practicalHours}h = {course.practicalCredits.toFixed(2)} credits</span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Total Hours:</span>
                                      <span className="font-medium">{course.totalHours}h</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Total Credits:</span>
                                      <span className="font-medium text-green-600 font-semibold">{course.creditsEarned.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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

export default AdminBPRNDClaimsPage;
