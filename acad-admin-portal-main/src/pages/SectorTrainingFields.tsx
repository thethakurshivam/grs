import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ArrowLeft, BookOpen, Hash } from "lucide-react";
import { useSectorTraining } from "@/hooks/useSectorTraining";

const SectorTrainingFields = () => {
  const navigate = useNavigate();
  const { 
    fields, 
    loading, 
    error, 
    fetchFields 
  } = useSectorTraining();

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const handleFieldClick = (fieldId: string) => {
    navigate(`/dashboard/sector-training/${fieldId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${error ? 'bg-red-100' : 'bg-blue-100'}`}>
                <Target className={`h-8 w-8 ${error ? 'text-red-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sector Training Fields</h1>
                {loading ? (
                  <p className="text-gray-600 mt-1">Loading fields...</p>
                ) : error ? (
                  <div>
                    <p className="text-red-600 mt-1">Error: {error}</p>
                    <Button 
                      onClick={fetchFields}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-600 mt-1">
                    {fields.length} specialized training programs available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              // Loading State
              [...Array(8)].map((_, index) => (
                <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : fields.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="bg-white rounded-lg shadow-md p-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Fields Found</h3>
                  <p className="text-gray-600">No sector training fields are currently available.</p>
                  <Button 
                    onClick={fetchFields}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              fields.map((field, index) => (
                <Card 
                  key={field._id || `field-${index}`} 
                  className="group relative bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 rounded-xl overflow-hidden"
                  onClick={() => {
                    if (field._id) {
                      handleFieldClick(field._id);
                    }
                  }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-900 transition-colors">
                          {field.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 font-medium">Training Sector</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:shadow-blue-200 group-hover:scale-110 transition-all duration-300">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      {/* Main stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <div className="text-3xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                            {field.count}
                          </div>
                          <div className="text-sm text-gray-500 font-medium">Available Courses</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                          <BookOpen className="h-4 w-4" />
                          <span>Explore</span>
                        </div>
                      </div>
                      
                      {/* Action area */}
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-600">Active Field</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                            <span>View Details</span>
                            <BookOpen className="h-3 w-3" />
                          </div>
                        </div>
                        
                        {/* Courses Link */}
                        <div 
                          className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 group/api"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            const fieldId = field.id || field._id;
                            if (fieldId) {
                              navigate(`/dashboard/field-courses/${fieldId}`);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600">Click me</span>
                            </div>
                            <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-800 bg-white px-3 py-2 rounded border">
                              Courses
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Summary */}
          {!loading && fields.length > 0 && (
            <div className="mt-8">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
                      <p className="text-gray-600">Total fields available for sector training</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{fields.length}</div>
                      <div className="text-sm text-gray-600">Fields</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorTrainingFields;