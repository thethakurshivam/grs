import React from 'react';
import { StudentDashboardLayout } from '@/components/student/StudentDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, GraduationCap, BookOpen } from 'lucide-react';
import useBPRNDValues from '@/hooks/useBPRNDValues';

const BPRNDCertifications: React.FC = () => {
  const { data, isLoading, error, refetch } = useBPRNDValues();

  const getQualificationIcon = (qualification: string) => {
    switch (qualification.toLowerCase()) {
      case 'certificate':
        return <Award className="h-5 w-5 text-blue-600" />;
      case 'diploma':
        return <GraduationCap className="h-5 w-5 text-gray-600" />;
      case 'pg diploma':
        return <BookOpen className="h-5 w-5 text-gray-600" />;
      default:
        return <Award className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Simple Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">
            BPR&D Certifications
          </h1>
          <p className="text-gray-600">
            Professional development pathways through structured certification levels
          </p>
        </div>

        {/* Main Content */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Available Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                <span className="ml-3 text-gray-600">Loading...</span>
              </div>
            )}
            
            {error && !isLoading && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={refetch} 
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-all duration-200 text-sm hover:scale-105 transform"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {!isLoading && !error && (
              <div className="space-y-4">
                {data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.map((item, index) => (
                      <div 
                        key={item._id} 
                        className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-300 cursor-pointer group bg-white hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="group-hover:scale-110 transition-transform duration-200">
                            {getQualificationIcon(item.qualification)}
                          </div>
                          <span className="text-sm font-medium text-gray-700 uppercase tracking-wide group-hover:text-gray-900 transition-colors duration-200">
                            {item.qualification}
                          </span>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">{item.credit}</div>
                          <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">Credits Required</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No certifications available</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simple Info Section */}
        <div className="text-center text-sm text-gray-500 space-y-2 hover:text-gray-600 transition-colors duration-200">
          <p>Complete training programs to earn credits and qualify for certifications</p>
          <p>Start with the certificate level and progress through diploma qualifications</p>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default BPRNDCertifications;


