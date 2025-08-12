import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useBPRNDPendingCredits from '@/hooks/useBPRNDPendingCredits';
import { useToast } from '@/hooks/use-toast';

interface Props { type?: 'standard' | 'bprnd' }
const POCRequestsPage: React.FC<Props> = ({ type = 'standard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/poc-portal/bprnd') ? '/poc-portal/bprnd' : '/poc-portal';
  const { data, isLoading, error, refetch } = useBPRNDPendingCredits();
  const [actedIds, setActedIds] = useState<Record<string, true>>({});
  const { toast } = useToast();
  
  const handleAccept = async (item: {
    id: string;
    studentId?: string;
    name: string;
    organization: string;
    discipline: string;
    totalHours: number;
    noOfDays: number;
    pdf: string | null;
  }) => {
    try {
      const studentId = item.studentId || '';
      if (!studentId) {
        toast({ title: 'Missing student ID', description: 'This request has no studentId. Please ensure the student submission included their ID.', variant: 'destructive' });
        return;
      }

      const res = await fetch(`http://localhost:3003/api/bprnd/pending-credits/${encodeURIComponent(studentId)}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          organization: item.organization,
          discipline: item.discipline,
          totalHours: item.totalHours,
          noOfDays: item.noOfDays,
          pdf: item.pdf,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Failed with status ${res.status}`);
      }

      toast({
        title: 'Credits applied',
        description: `New credits: ${json?.data?.newCredits} | Total: ${json?.data?.updatedTotalCredits}`,
      });
      setActedIds((prev) => ({ ...prev, [item.id]: true }));
      // Optional backend refetch to update list if needed
      // refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error applying credits';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const totalRequests = data.length;

  return (
    <div className={type === 'bprnd' ? 'min-h-screen bg-blue-50 text-black' : 'min-h-screen bg-gray-50'}>
      {/* Header */}
      <header className={type === 'bprnd' ? 'bg-white shadow-sm border-b border-[#0b2e63]/20' : 'bg-white shadow-sm border-b border-gray-200'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(basePath)}
                className={type === 'bprnd' ? 'flex items-center space-x-2 text-black hover:text-[#0b2e63]' : 'flex items-center space-x-2 text-gray-600 hover:text-gray-900'}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to POC Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-orange-600" />
              </div>
              <span className={type === 'bprnd' ? 'text-sm font-semibold text-black' : 'text-sm font-medium text-gray-700'}>POC Requests</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className={type === 'bprnd' ? 'text-3xl font-extrabold text-[#0b2e63] mb-2' : 'text-3xl font-bold text-gray-900 mb-2'}>Requests Management</h2>
          <p className={type === 'bprnd' ? 'text-black/80' : 'text-gray-600'}>Manage and monitor all pending approval requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalRequests}</div>
            </CardContent>
          </Card>
        </div>

        <div className={type === 'bprnd' ? 'bg-white rounded-lg shadow-sm border border-[#0b2e63]/20 p-6 mb-6' : 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'}>
          <div className="flex items-center justify-between">
            <p className={type === 'bprnd' ? 'text-black font-semibold' : 'text-gray-600'}>Pending credit submissions</p>
            <Button variant="outline" onClick={refetch}>Refresh</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approval Requests</CardTitle>
            <CardDescription>All pending credit submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p className={type === 'bprnd' ? 'text-black' : 'text-gray-600'}>Loading pending credits...</p>}
            {error && !isLoading && <p className="text-red-600">{error}</p>}
            {!isLoading && !error && (
              <div className="space-y-4">
                {data.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className={type === 'bprnd' ? 'font-semibold text-black' : 'font-medium text-gray-900'}>{item.name}</h3>
                        <p className={type === 'bprnd' ? 'text-sm text-black/80' : 'text-sm text-gray-500'}>Organization: {item.organization}</p>
                        <p className={type === 'bprnd' ? 'text-sm text-black/80' : 'text-sm text-gray-500'}>Discipline: {item.discipline}</p>
                        <p className={type === 'bprnd' ? 'text-sm text-black/80' : 'text-sm text-gray-500'}>Total Hours: {item.totalHours} • Days: {item.noOfDays}</p>
                        {item.pdf && (
                          <a
                            className="inline-flex items-center text-sm text-[#0b2e63] hover:underline mt-1"
                            href={item.pdf}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View PDF <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!actedIds[item.id] && (
                        <>
                          <button
                            onClick={() => handleAccept(item)}
                            className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md"
                          >
                            Accept
                          </button>
                          <a
                            onClick={() => setActedIds((prev) => ({ ...prev, [item.id]: true }))}
                            href={item.rejectUrl}
                            className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                          >
                            Reject
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {data.length === 0 && <p className="text-gray-600">No pending credits found.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default POCRequestsPage; 