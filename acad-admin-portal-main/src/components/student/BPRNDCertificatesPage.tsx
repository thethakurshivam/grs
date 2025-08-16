import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Award, Calendar, Hash, Shield } from 'lucide-react';
import { useBPRNDStudentCertificates } from '../../hooks/useBPRNDStudentCertificates';

export const BPRNDCertificatesPage: React.FC = () => {
  const { certificates, loading, error, fetchCertificates, clearError } = useBPRNDStudentCertificates();

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
          <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Student Certificates</h1>
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
          <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Student Certificates</h1>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold text-[#0b2e63]">BPR&D Student Certificates</h1>
        <p className="text-lg text-black mt-2">Your earned certifications and qualifications</p>
      </div>

      {certificates.length === 0 ? (
        <Card className="border border-[#0b2e63]/20 bg-white rounded-xl">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Award className="w-16 h-16 text-[#0b2e63]/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
              <p className="text-gray-600">You haven't earned any certificates yet. Complete training courses to earn your first certification.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <Card key={certificate._id} className="border border-[#0b2e63]/20 bg-white hover:shadow-lg transition-shadow rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-[#0b2e63] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#0b2e63]" />
                    {formatUmbrellaKey(certificate.umbrellaKey)}
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-[#0b2e63]/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-[#0b2e63]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Qualification</p>
                    <p className="font-medium text-gray-900 text-sm">{certificate.qualification || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Certificate No</p>
                    <p className="font-medium text-gray-900 text-sm font-mono">{certificate.certificateNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Issued Date</p>
                    <p className="font-medium text-gray-900 text-sm">{formatDate(certificate.issuedAt)}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-[#0b2e63]">
                      <Hash className="w-3 h-3" />
                      <span className="font-medium">ID: {certificate._id.slice(-8)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {certificates.length > 0 && (
        <div className="mt-6">
          <Card className="border border-[#0b2e63]/20 bg-[#0b2e63]/5 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#0b2e63]/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-[#0b2e63]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0b2e63]">Total Certificates Earned</h3>
                    <p className="text-sm text-gray-600">You have successfully completed {certificates.length} certification program{certificates.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#0b2e63]">{certificates.length}</div>
                  <div className="text-sm text-gray-600">Certificates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
