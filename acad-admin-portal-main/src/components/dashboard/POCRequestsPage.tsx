import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, ArrowLeft, ExternalLink, Clock, Building2, BookOpen, FileText, CheckCircle, XCircle } from 'lucide-react';
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
    theoryHours?: number;
    practicalHours?: number;
    theoryCredits?: number;
    practicalCredits?: number;
    totalHours: number;
    calculatedCredits?: number;
    noOfDays: number;
    pdf: string | null;
    acceptUrl?: string;
  }) => {
    try {
      // Use the acceptUrl provided by the backend, or construct it if not available
      const acceptUrl = item.acceptUrl || `http://localhost:3000/bprnd-poc/pending-credits/${item.id}/accept`;
      
      console.log('🔍 Accepting pending credit:', item.id);
      console.log('🔗 Using accept URL:', acceptUrl);

      const res = await fetch(acceptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No body needed for accept - the backend will process the existing pending credit record
      });

      const json = await res.json().catch(() => ({}));
      console.log('📡 Response from accept endpoint:', json);
      
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `Failed with status ${res.status}`);
      }

      // Show success message with the actual response data
      const creditsApplied = json?.data?.creditsApplied || 'Unknown';
      const umbrellaField = json?.data?.umbrellaField || 'Unknown';
      
      toast({
        title: 'Credits approved successfully!',
        description: `Applied ${creditsApplied} credits to ${umbrellaField} field. Pending request has been processed.`,
      });
      setActedIds((prev) => ({ ...prev, [item.id]: true }));
      
      // Refetch to update the list after successful approval
      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error applying credits';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const totalRequests = data.length;
  const pendingRequests = data.filter(item => !actedIds[item.id]).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(basePath)}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Requests Management</h1>
                <p className="text-sm text-gray-500">Monitor and approve pending submissions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalRequests}</div>
              <p className="text-sm text-gray-500 mt-1">All time submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{pendingRequests}</div>
              <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalRequests - pendingRequests}</div>
              <p className="text-sm text-gray-500 mt-1">Completed actions</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-800 flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                  Pending Approval Requests
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">
                  Review and approve credit submissions from students
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refetch}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                <span className="ml-3 text-gray-500">Loading requests...</span>
              </div>
            )}
            
            {error && !isLoading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-red-600 font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={refetch}
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            )}
            
            {!isLoading && !error && (
              <div className="space-y-4">
                {data.filter(item => !actedIds[item.id]).map((item) => (
                  <div key={item.id} className="p-6 border border-gray-200 rounded-xl space-y-4 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {item.organization}
                            </span>
                            <span className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              {item.discipline}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleAccept(item)}
                          size="sm"
                          className="bg-gray-800 hover:bg-gray-900 text-white border-0"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActedIds((prev) => ({ ...prev, [item.id]: true }))}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        Course Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-sm">
                          <p className="text-gray-600 font-medium">Duration</p>
                          <p className="text-gray-700">{item.noOfDays} days</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600 font-medium">Total Hours</p>
                          <p className="text-gray-700">{item.totalHours} hours</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600 font-medium">Total Credits</p>
                          <p className="text-gray-700 font-semibold">{(item.calculatedCredits || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Credit Breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        Credit Breakdown
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Theory Hours: <span className="font-medium text-gray-700">{item.theoryHours || 0}h</span></p>
                          <p className="text-gray-600">Theory Credits: <span className="font-medium text-gray-700">{(item.theoryCredits || 0).toFixed(2)}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Practical Hours: <span className="font-medium text-gray-700">{item.practicalHours || 0}h</span></p>
                          <p className="text-gray-600">Practical Credits: <span className="font-medium text-gray-700">{(item.practicalCredits || 0).toFixed(2)}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* PDF Document */}
                    {item.pdf && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          Supporting Document
                        </h4>
                        <a
                          className="inline-flex items-center text-sm text-gray-700 hover:text-gray-800 font-medium"
                          href={item.pdf}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View PDF Document
                          <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                
                {data.filter(item => !actedIds[item.id]).length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                    <p className="text-gray-500">All credit submissions have been processed.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default POCRequestsPage; 