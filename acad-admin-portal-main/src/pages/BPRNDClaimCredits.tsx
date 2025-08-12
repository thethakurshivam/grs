import React from 'react';
import { StudentDashboardLayout } from '@/components/student/StudentDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useBPRNDCertifications from '@/hooks/useBPRNDCertifications';
import { useToast } from '@/hooks/use-toast';

const BPRNDClaimCredits: React.FC = () => {
  const storedBprnd = typeof window !== 'undefined' ? localStorage.getItem('bprndStudentData') : null;
  let derivedId: string | null = null;
  try { if (storedBprnd) { const p = JSON.parse(storedBprnd); derivedId = p?._id || null; } } catch {}
  const studentId = derivedId || (typeof window !== 'undefined' ? (localStorage.getItem('bprndStudentId') || localStorage.getItem('studentId')) : null);

  const { data, isLoading, error, refetch } = useBPRNDCertifications(studentId);
  const { toast } = useToast();

  const handleClaim = async (
    item: { fieldKey: string; field: string; qualification: string }
  ) => {
    if (!studentId) {
      toast({ title: 'Missing ID', description: 'Please log in again.', variant: 'destructive' });
      return;
    }

    try {
      const url = `http://localhost:3004/student/${encodeURIComponent(
        studentId
      )}/umbrella/${encodeURIComponent(item.field)}/redeem/${encodeURIComponent(
        item.qualification
      )}`;

      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Failed with status ${res.status}`);
      }

      toast({
        title: 'Certification claimed',
        description: `Umbrella: ${json?.data?.umbrella?.replace(/_/g, ' ')} | Decrement: ${json?.data?.decredit} | Updated: ${json?.data?.updated}`,
      });
      // Optionally refresh eligibility list to reflect changes
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claim Credits</h1>
          <p className="text-gray-700 mt-2">Review your eligibility and claim certifications.</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#0b2e63]">Eligible Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            {!studentId && (
              <p className="text-red-600">Missing student ID. Please log in again.</p>
            )}
            {isLoading && <p className="text-gray-600">Loading eligibility...</p>}
            {error && !isLoading && (
              <div className="flex items-center justify-between">
                <p className="text-red-600">{error}</p>
                <button onClick={refetch} className="text-sm text-[#0b2e63] underline">Retry</button>
              </div>
            )}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((item) => (
                  <Card key={`${item.fieldKey}-${item.qualification}`} className="border border-[#0b2e63]/20">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-[#0b2e63]">{item.field} — {item.qualification}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-3">Credits: {item.credits}</p>
                      <button
                        onClick={() => handleClaim(item)}
                        className="inline-flex items-center px-3 py-2 text-sm bg-[#0b2e63] hover:bg-[#09264f] text-white rounded-md"
                      >
                        Claim Certification
                      </button>
                    </CardContent>
                  </Card>
                ))}
                {data.length === 0 && (
                  <p className="text-gray-600">No eligible certifications found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
};

export default BPRNDClaimCredits;


