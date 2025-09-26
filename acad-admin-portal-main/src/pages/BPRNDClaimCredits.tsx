import React from 'react';
import { StudentDashboardLayout } from '@/components/student/StudentDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useBPRNDCertifications from '@/hooks/useBPRNDCertifications';
import { useToast } from '@/hooks/use-toast';
import { useCenteredToastContext } from '@/contexts/centered-toast-context';
import { useNavigate } from 'react-router-dom';

const BPRNDClaimCredits: React.FC = () => {
  const storedBprnd = typeof window !== 'undefined' ? localStorage.getItem('bprndStudentData') : null;
  let derivedId: string | null = null;
  try { if (storedBprnd) { const p = JSON.parse(storedBprnd); derivedId = p?._id || null; } } catch {}
  const studentId = derivedId || (typeof window !== 'undefined' ? (localStorage.getItem('bprndStudentId') || localStorage.getItem('studentId')) : null);

  const { data, isLoading, error, refetch } = useBPRNDCertifications(studentId);
  const { toast } = useToast();
  const { showSuccess } = useCenteredToastContext();
  const navigate = useNavigate();

  const handleRequest = async (
    item: { fieldKey: string; field: string; qualification: string }
  ) => {
    if (!studentId) {
      toast({ title: 'Missing ID', description: 'Please log in again.', variant: 'destructive' });
      return;
    }

    try {
      const url = `http://localhost:3000/bprnd-student/${encodeURIComponent(studentId)}/certifications/request`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ umbrellaKey: item.fieldKey, qualification: item.qualification }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Failed with status ${res.status}`);
      }

      // Show centered success toast for certification request
      showSuccess(
        'Certification Request Submitted!', 
        `Your request for ${item.field} — ${item.qualification} has been submitted successfully.`,
        3000 // 3 seconds
      );
      
      // Automatically redirect to BPRND student dashboard after 3 seconds
      setTimeout(() => {
        navigate('/student/bprnd/dashboard');
      }, 3000); // 3 seconds delay to match the popup duration
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BPR&D Request Certification</h1>
          <p className="text-gray-700 mt-2">Review your eligibility and request certifications for approval.</p>
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
                        onClick={() => handleRequest(item)}
                        className="inline-flex items-center px-3 py-2 text-sm bg-[#0b2e63] hover:bg-[#09264f] text-white rounded-md"
                      >
                        Request Certification
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


