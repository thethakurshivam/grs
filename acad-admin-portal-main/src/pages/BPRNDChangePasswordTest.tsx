import React from 'react';
import { BPRNDChangePassword } from '@/components/student/BPRNDChangePassword';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

const BPRNDChangePasswordTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">BPR&D Change Password Test</h1>
          <p className="text-gray-600">Test the password change functionality</p>
        </div>
        
        <div className="space-y-4">
          <BPRNDChangePassword>
            <Button className="w-full" variant="default">
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </BPRNDChangePassword>
          
          <div className="text-sm text-gray-500 text-center">
            Click the button above to test the password change modal
          </div>
        </div>
      </div>
    </div>
  );
};

export default BPRNDChangePasswordTest;
