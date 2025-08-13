import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard, Coins, Award } from 'lucide-react';
import { useStudentAvailableCredits } from '@/hooks/useStudentAvailableCredits';
import { useStudentUsedCredits } from '@/hooks/useStudentUsedCredits';

const NormalCreditBankPage: React.FC = () => {
  const studentId = localStorage.getItem('studentId') || '';
  const { availableCredits, loading: loadingAvail, error: errorAvail, fetchAvailableCredits } = useStudentAvailableCredits();
  const { usedCredits, loading: loadingUsed, error: errorUsed, fetchUsedCredits } = useStudentUsedCredits();

  useEffect(() => {
    if (studentId) {
      fetchAvailableCredits(studentId);
      fetchUsedCredits(studentId);
    }
  }, [studentId, fetchAvailableCredits, fetchUsedCredits]);

  const totalCredits = (availableCredits || 0) + (usedCredits || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Credit Bank</h1>
        <p className="text-gray-700 mt-2">Your credits overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-gray-900">{loadingAvail || loadingUsed ? '...' : totalCredits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Coins className="h-5 w-5 text-orange-600" />
              Available Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorAvail ? (
              <p className="text-sm text-red-600">{errorAvail}</p>
            ) : (
              <p className="text-2xl font-semibold text-gray-900">{loadingAvail ? '...' : availableCredits}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Award className="h-5 w-5 text-red-600" />
              Used Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorUsed ? (
              <p className="text-sm text-red-600">{errorUsed}</p>
            ) : (
              <p className="text-2xl font-semibold text-gray-900">{loadingUsed ? '...' : usedCredits}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NormalCreditBankPage;
