import React from 'react';
import { StudentDashboardLayout } from '@/components/student/StudentDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useBPRNDValues from '@/hooks/useBPRNDValues';

const BPRNDCertifications: React.FC = () => {
  const { data, isLoading, error, refetch } = useBPRNDValues();

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
          <p className="text-gray-700 mt-2">View available certifications mapping by credits.</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#0b2e63]">Credit → Qualification</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-gray-600">Loading certifications...</p>}
            {error && !isLoading && (
              <div className="flex items-center justify-between"> 
                <p className="text-red-600">{error}</p>
                <button onClick={refetch} className="text-sm text-[#0b2e63] underline">Retry</button>
              </div>
            )}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((item) => (
                  <Card key={item._id} className="border border-[#0b2e63]/20">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-[#0b2e63]">{item.qualification}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-semibold text-gray-900">{item.credit} Credits</p>
                    </CardContent>
                  </Card>
                ))}
                {data.length === 0 && (
                  <p className="text-gray-600">No certifications found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
};

export default BPRNDCertifications;


