import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePOCMOUs } from '@/hooks/usePOCMOUs';

const POCMOUsListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/poc-portal/bprnd') ? '/poc-portal/bprnd' : '/poc-portal';
  const { mous, loading, error } = usePOCMOUs();


  const getValidityStatus = (validity: string) => {
    // Simple logic to determine if MOU is active based on validity
    if (validity.includes('years') || validity.includes('year')) {
      return 'active';
    }
    return 'active'; // Default to active for now
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MOUs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate(basePath)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(basePath)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">POC MOUs</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            POC MOUs Management
          </h1>
          <p className="text-gray-600">
            View and manage all Memorandum of Understanding agreements associated with your POC account.
          </p>
        </div>





        {/* MOUs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mous.map((mou) => (
            <Card key={mou._id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {mou.nameOfPartnerInstitution}
                  </CardTitle>
                  <Badge className={getStatusColor(getValidityStatus(mou.validity))}>
                    {getValidityStatus(mou.validity)}
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 line-clamp-2">
                  MOU ID: {mou.ID}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Strategic Areas:</span>
                  <span className="font-medium text-gray-900 text-xs text-right max-w-32">
                    {mou.strategicAreas}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date of Signing:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(mou.dateOfSigning).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Validity:</span>
                  <span className="font-medium text-gray-900">{mou.validity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Affiliation Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(mou.affiliationDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">School ID:</span>
                  <span className="font-medium text-gray-900 font-mono text-xs">
                    {mou.school}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {mous.length === 0 && (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No MOUs found</h3>
            <p className="text-gray-600">
              No MOUs are currently available.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default POCMOUsListPage; 