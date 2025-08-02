import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard } from 'lucide-react';

export const CreditBankPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Credit Bank</h1>
        <p className="text-gray-700 mt-2">View your credit history and balance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-purple-600" />
            Credit Bank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This feature is coming soon. You will be able to view your credit history and balance here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}; 