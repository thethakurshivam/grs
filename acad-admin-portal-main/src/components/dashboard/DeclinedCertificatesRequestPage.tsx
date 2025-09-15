import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldAlert, FileX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeclinedCertificatesRequestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/poc-portal/bprnd')} className="hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Declined Certificates Request</h1>
          <p className="text-base text-gray-500">Manage declined certificate requests and review rejection reasons</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-0 shadow-sm bg-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-600" />
            Feature Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <FileX className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Declined Certificates Request</h3>
            <p className="text-base text-gray-500 mb-6 max-w-md mx-auto">
              This feature is currently under development. You'll be able to view and manage declined certificate requests here.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• View declined certificate requests</p>
              <p>• Review rejection reasons</p>
              <p>• Manage certificate status updates</p>
              <p>• Export declined requests data</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/poc-portal/bprnd')}
          className="flex items-center gap-2 text-base text-gray-500 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default DeclinedCertificatesRequestPage;
