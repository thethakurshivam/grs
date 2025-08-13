import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

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
    try { if (b) { const p = JSON.parse(b); if (p?._id) return p._id as string; } } catch {}
    return localStorage.getItem('bprndStudentId') || localStorage.getItem('studentId') || '';
  })();

  const fetchClaims = useCallback(async () => {
    try {
      if (!studentId) throw new Error('Missing studentId');
      setLoading(true);
      setError(null);
      const res = await fetch(`http://localhost:3004/student/${encodeURIComponent(studentId)}/claims`);
      const json = await res.json();
      if (!res.ok || json?.success === false) throw new Error(json?.message || `HTTP ${res.status}`);
      setClaims(json.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  return (
    <div className="space-y-6 m-6">
      <div className="p-6 bg-white border border-blue-200 rounded-lg shadow-lg">
         <h1 className="text-2xl font-bold text-[#1e3a8a]">My Certification Requests</h1>
        <p className="text-gray-700">Track the status of your requests</p>
      </div>

      <Card className="bg-white border border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#1e3a8a]">Requests</CardTitle>
          <CardDescription className="text-gray-600">Total: {claims.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-700">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : claims.length === 0 ? (
            <p className="text-gray-700">No requests found.</p>
          ) : (
            <div className="space-y-3">
              {claims.map((c) => (
                <div key={c._id} className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
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
  );
};

export default BPRNDStudentClaimsPage;
