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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Certification Requests</h1>
        <p className="text-gray-700">Track the status of your requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>Total: {claims.length}</CardDescription>
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
                <div key={c._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{c.umbrellaKey.replace(/_/g, ' ')} — {c.qualification}</p>
                    <p className="text-sm text-gray-700">Required: {c.requiredCredits} | Status: {c.status}</p>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
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
