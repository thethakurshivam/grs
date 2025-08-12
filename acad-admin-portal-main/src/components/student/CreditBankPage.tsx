import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard } from 'lucide-react';
import useBPRNDCreditBreakdown from '@/hooks/useBPRNDCreditBreakdown';

export const CreditBankPage: React.FC = () => {
  const storedBprnd = localStorage.getItem('bprndStudentData');
  let derivedId: string | null = null;
  try {
    if (storedBprnd) {
      const parsed = JSON.parse(storedBprnd);
      derivedId = parsed?._id || null;
    }
  } catch (_) {}
  const studentId = derivedId || localStorage.getItem('bprndStudentId') || localStorage.getItem('studentId');

  const { data, isLoading, error } = useBPRNDCreditBreakdown(studentId);

  const entries = useMemo(
    () =>
      data
        ? Object.entries(data) as Array<[string, number]>
        : [],
    [data]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Credit Bank</h1>
        <p className="text-gray-700 mt-2">View your credit breakdown by umbrella.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-[#0b2e63]" />
            Credit Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-gray-600">Loading credit breakdown...</p>
          )}
          {error && !isLoading && (
            <p className="text-red-600">{error}</p>
          )}
          {!isLoading && !error && entries.length === 0 && (
            <p className="text-gray-600">No credit data available.</p>
          )}
          {!isLoading && !error && entries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map(([label, value]) => (
                <Card key={label} className="border border-[#0b2e63]/20">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-[#0b2e63]">
                      {label.replaceAll('_', ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold text-gray-900">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};