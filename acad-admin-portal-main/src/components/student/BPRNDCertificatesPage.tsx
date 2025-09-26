import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Award, Calendar, Hash, Shield, Download } from 'lucide-react';
import { useBPRNDStudentCertificates } from '../../hooks/useBPRNDStudentCertificates';
import { useToast } from '@/hooks/use-toast';

export const BPRNDCertificatesPage: React.FC = () => {
  const { certificates, loading, error, fetchCertificates, clearError } = useBPRNDStudentCertificates();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Use the same logic as the dashboard to get student ID
    const storedBprnd = localStorage.getItem('bprndStudentData');
    let derivedId: string | null = null;
    try {
      if (storedBprnd) {
        const parsed = JSON.parse(storedBprnd);
        derivedId = parsed?._id || null;
      }
    } catch (_) {
      // ignore JSON parse errors
    }
    const studentId = derivedId || localStorage.getItem('bprndStudentId') || localStorage.getItem('studentId');
    
    if (studentId) {
      console.log('Fetching certificates for student ID:', studentId);
      fetchCertificates(studentId);
    } else {
      console.error('No student ID found for certificates');
    }
  }, [fetchCertificates]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Trainee Certificates</h1>
          <p className="text-lg text-black mt-2">Loading your certificates...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b2e63]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Trainee Certificates</h1>
          <p className="text-lg text-black mt-2">Error loading certificates</p>
        </div>
        <Card className="border border-red-200 bg-white rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="mt-4 px-4 py-2 bg-[#0b2e63] text-white rounded-lg hover:bg-[#0b2e63]/90 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatUmbrellaKey = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDownloadCertificate = async (certificateId: string) => {
    setDownloadingId(certificateId);
    try {
      const response = await fetch(`http://localhost:3000/bprnd-student/certificate/${certificateId}/pdf`, {
        method: 'GET',
      });

      if (response.ok) {
        // Create a blob from the PDF data
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bprnd-certificate-${certificateId}.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Show success notification
        toast({
          title: "Download Started",
          description: "Certificate PDF is being downloaded to your device.",
          duration: 3000,
        });
      } else {
        console.error('Failed to download certificate:', response.statusText);
        toast({
          title: "Download Failed",
          description: "Failed to download certificate. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
              alert("Error downloading certificate. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
          <Award className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">BPR&D Trainee Certificates</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Your earned certifications and qualifications - a testament to your professional development</p>
      </div>

      {certificates.length === 0 ? (
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-6">
                <Award className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Certificates Yet</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">You haven't earned any certificates yet. Complete training courses to earn your first certification and advance your career.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate, index) => (
            <Card key={certificate._id} className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden group">
              {/* Subtle top accent */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-300"></div>
              
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-gray-600" />
                    </div>
                    {formatUmbrellaKey(certificate.umbrellaKey)}
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Qualification */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">Qualification</p>
                    <p className="font-semibold text-gray-900 text-sm">{certificate.qualification || 'N/A'}</p>
                  </div>
                  
                  {/* Certificate Number */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">Certificate No</p>
                    <p className="font-mono font-semibold text-gray-900 text-sm">{certificate.certificateNo}</p>
                  </div>
                  
                  {/* Issued Date */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">Issued Date</p>
                    <p className="font-semibold text-gray-900 text-sm">{formatDate(certificate.issuedAt)}</p>
                  </div>
                  
                  {/* Footer with ID and Download */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Hash className="w-3 h-3" />
                        <span className="font-medium">ID: {certificate._id.slice(-8)}</span>
                      </div>
                      <button
                        onClick={() => handleDownloadCertificate(certificate._id)}
                        disabled={downloadingId === certificate._id}
                        className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingId === certificate._id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3" />
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {certificates.length > 0 && (
        <div className="mt-8">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-900 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Total Certificates Earned</h3>
                    <p className="text-gray-600">You have successfully completed {certificates.length} certification program{certificates.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-gray-900">{certificates.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Certificates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
