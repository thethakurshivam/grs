import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { StudentDashboardLayout } from './StudentDashboardLayout';

interface Claim {
  _id: string;
  umbrellaKey: string;
  qualification: 'certificate' | 'diploma' | 'pg diploma';
  requiredCredits: number;
  status: 'pending' | 'admin_approved' | 'poc_approved' | 'approved' | 'declined';
  createdAt: string;
  updatedAt: string;
}

const BPRNDStudentClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentId = (() => {
    const b = localStorage.getItem('bprndStudentData');
    let derivedId: string | null = null;
    try { 
      if (b) { 
        const p = JSON.parse(b); 
        if (p?._id) derivedId = p._id as string; 
      } 
    } catch (e) {
      console.error('Error parsing bprndStudentData:', e);
    }
    const finalId = derivedId || localStorage.getItem('bprndStudentId') || localStorage.getItem('studentId') || '';
    console.log('Student ID resolved:', { derivedId, finalId, hasBprndData: !!b });
    return finalId;
  })();

  const fetchClaims = useCallback(async () => {
    try {
      if (!studentId) {
        console.error('Missing studentId for claims fetch');
        setError('Student ID not found. Please log in again.');
        setClaims([]);
        return;
      }
      
      console.log('Fetching claims for student ID:', studentId);
      setLoading(true);
      setError(null);
      
      const res = await fetch(`http://localhost:3000/bprnd-student/${encodeURIComponent(studentId)}/claims`);
      console.log('Claims API response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Claims API error:', res.status, errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const json = await res.json();
      console.log('Claims API response data:', json);
      
      if (json?.success === false) {
        throw new Error(json?.message || 'API returned error');
      }
      
      setClaims(json.data || []);
    } catch (e) {
      console.error('Error fetching claims:', e);
      setError(e instanceof Error ? e.message : 'Failed to load claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  // Safety check - don't render if no student ID
  if (!studentId) {
    return (
      <StudentDashboardLayout>
        <div className="space-y-6">
          <div className="p-8 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-red-900">Authentication Required</h1>
            </div>
            <p className="text-red-700 text-lg">Please log in to view your certification requests.</p>
            <p className="text-red-600 text-sm mt-2">No student ID found in session.</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div className="p-8 bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-200/50 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">My Certification Requests</h1>
          </div>
          <p className="text-gray-600 text-lg">Track the status of your certification requests</p>
        </div>

        <Card className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/50 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50 px-8 py-6">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Requests</CardTitle>
            <CardDescription className="text-gray-600 text-lg">Total: <span className="font-semibold text-indigo-600">{claims.length}</span></CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-700">Loading claims...</span>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 font-medium mb-2">Error loading claims:</p>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchClaims}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : claims.length === 0 ? (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <p className="text-gray-700">No certification requests found.</p>
                <p className="text-gray-500 text-sm mt-1">You haven't submitted any certification requests yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {claims.map((c) => (
                  <div key={c._id} className="flex items-center justify-between p-6 border border-gray-200/50 rounded-xl bg-gradient-to-br from-white to-gray-50/50 hover:from-gray-50/50 hover:to-gray-100/50 hover:shadow-lg hover:border-gray-300/50 transition-all duration-300">
                    <div>
                      <p className="font-semibold text-[#1e3a8a]">{c.umbrellaKey.replace(/_/g, ' ')} — {c.qualification}</p>
                      <p className="text-sm text-gray-700">Required: {c.requiredCredits} | Status: <span className={`font-medium ${
                        c.status === 'approved' ? 'text-green-600' : 
                        c.status === 'declined' ? 'text-red-600' : 
                        c.status === 'pending' ? 'text-orange-600' : 
                        'text-blue-600'
                      }`}>{c.status}</span></p>
                    </div>
                    <div className="text-xs text-gray-600">{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
};

export default BPRNDStudentClaimsPage;
