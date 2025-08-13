import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, ShieldAlert, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Claim {
  _id: string;
  studentId: string;
  umbrellaKey: string;
  qualification: 'certificate' | 'diploma' | 'pg diploma';
  requiredCredits: number;
  status: 'pending' | 'admin_approved' | 'poc_approved' | 'approved' | 'declined';
  createdAt: string;
  updatedAt: string;
}

const POCBPRNDClaimsPage: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('pocToken');
      if (!token) throw new Error('Missing POC token');
      const res = await fetch('http://localhost:3003/api/bprnd/claims', {
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
      const token = localStorage.getItem('pocToken');
      if (!token) throw new Error('Missing POC token');
      const res = await fetch(`http://localhost:3003/api/bprnd/claims/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) throw new Error(json?.error || `HTTP ${res.status}`);
      await fetchClaims();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    }
  };

  const decline = async (id: string) => {
    try {
      const token = localStorage.getItem('pocToken');
      if (!token) throw new Error('Missing POC token');
      const res = await fetch(`http://localhost:3003/api/bprnd/claims/${id}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) throw new Error(json?.error || `HTTP ${res.status}`);
      await fetchClaims();
    } catch (e) {
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
          <h1 className="text-2xl font-bold">BPR&D Certification Requests</h1>
          <p className="text-gray-700">Approve or decline student certification requests</p>
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
            <div className="space-y-3">
              {claims.map((c) => (
                <div key={c._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{c.umbrellaKey.replace(/_/g, ' ')} — {c.qualification}</p>
                    <p className="text-sm text-gray-700">Required: {c.requiredCredits} | Status: {c.status}</p>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default POCBPRNDClaimsPage;
