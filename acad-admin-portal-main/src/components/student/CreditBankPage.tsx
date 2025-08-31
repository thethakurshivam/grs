import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard, Clock, Calendar, Award, Building, X } from 'lucide-react';
import useBPRNDCreditBreakdown from '@/hooks/useBPRNDCreditBreakdown';
import useBPRNDUmbrellas from '@/hooks/useBPRNDUmbrellas';

interface CourseHistoryItem {
  _id: string;
  name: string;
  organization: string;
  discipline: string;
  theoryHours?: number;
  practicalHours?: number;
  theoryCredits?: number;
  practicalCredits?: number;
  totalHours: number;
  noOfDays: number;
  creditsEarned: number;
  createdAt: string;
  // New properties for remaining credits calculation
  originalTheoryCredits?: number;
  originalPracticalCredits?: number;
  originalTotalCredits?: number;
  remainingTheoryCredits?: number;
  remainingPracticalCredits?: number;
  remainingTotalCredits?: number;
  creditsUsed?: number;
  isFullyAvailable?: boolean;
}

interface CourseHistoryResponse {
  umbrella: string;
  studentId: string;
  courses: CourseHistoryItem[];
  summary: {
    totalCourses: number;
    totalCredits: number;
    totalTheoryCredits: number;
    totalPracticalCredits: number;
    totalHours: number;
    totalDays: number;
    currentStoredCredits?: number;
    note?: string;
  };
}

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

  const { data: creditData, isLoading: creditsLoading, error: creditsError, refetch: refetchCredits } = useBPRNDCreditBreakdown(studentId);
  const { umbrellas, isLoading: umbrellasLoading, error: umbrellasError, refetch: refetchUmbrellas } = useBPRNDUmbrellas();

  // State for modal functionality
  const [selectedUmbrella, setSelectedUmbrella] = useState<string | null>(null);
  const [courseHistory, setCourseHistory] = useState<CourseHistoryResponse | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const onFocus = () => {
      refetchCredits();
      refetchUmbrellas();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetchCredits, refetchUmbrellas]);

  // Fetch course history when clicking on a card
  const fetchCourseHistory = async (fieldKey: string) => {
    if (!studentId || !fieldKey) return;

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      // Convert field key back to umbrella name for the API call
      // e.g., "Cyber_Security" -> "Cyber Security"
      const umbrellaName = fieldKey.replace(/_/g, ' ');
      
      // Encode the umbrella name for URL (handle spaces and special characters)
      const encodedUmbrella = encodeURIComponent(umbrellaName);
      const response = await fetch(`http://localhost:3004/student/${studentId}/course-history/${encodedUmbrella}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course history: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCourseHistory(data.data);
        setIsModalOpen(true);
      } else {
        throw new Error(data.message || 'Failed to fetch course history');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error fetching course history';
      setHistoryError(message);
      setCourseHistory(null);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle click on credit card
  const handleCardClick = (umbrella: string, fieldKey: string) => {
    setSelectedUmbrella(umbrella);
    // Use the field key (e.g., "Cyber_Security") for the API call, not the display title
    fetchCourseHistory(fieldKey);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUmbrella(null);
    setCourseHistory(null);
    setHistoryError(null);
  };

  // Group umbrella fields into main categories
  const groupedUmbrellas = useMemo(() => {
    if (!umbrellas.length) return {};

    const groups: Record<string, string[]> = {
      'Police Administration': [
        'Tourism Police',
        'Women in Security and Police',
        'Traffic Management and Road Safety',
        'Border Management',
        'Disaster Risk Reduction'
      ],
      'Cyber Security': [
        'Cyber Law',
        'Cyber Threat Intelligence',
        'OSI Model',
        'Social Media Security',
        'Cyber Security'
      ],
      'Forensics': [
        'Behavioral Sciences',
        'Forensics Psychology',
        'Gender Sensitisation'
      ]
    };

    // Filter to only include umbrellas that exist in the database
    const existingUmbrellaNames = umbrellas.map(u => u.name);
    
    Object.keys(groups).forEach(category => {
      groups[category] = groups[category].filter(umbrella => 
        existingUmbrellaNames.includes(umbrella)
      );
    });

    return groups;
  }, [umbrellas]);

  // Calculate total credits for each main category
  const categoryTotals = useMemo(() => {
    if (!creditData) return {};

    const totals: Record<string, number> = {};
    Object.entries(groupedUmbrellas).forEach(([category, umbrellas]) => {
      totals[category] = umbrellas.reduce((sum, umbrella) => {
        const fieldKey = umbrella.replace(/\s+/g, '_');
        return sum + (Number(creditData[fieldKey]) || 0);
      }, 0);
    });

    return totals;
  }, [creditData, groupedUmbrellas]);



  const isLoading = creditsLoading || umbrellasLoading;
  const error = creditsError || umbrellasError;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Credit Bank</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          View your available credits across different disciplines. Click on any umbrella card to see detailed course history and track your professional development progress.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-4xl mx-auto">
          <p className="text-gray-700 text-base leading-relaxed">
            <strong>💡 Note:</strong> Credit bank shows your <strong>available credits</strong> (credits you can spend on certifications). 
            Click on any umbrella card to view detailed course history and remaining credits for each course.
          </p>
        </div>
      </div>

      {/* Credit Cards Section - Full width since we removed the course history section */}
      <div className="w-full">
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200 px-8 py-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              Credit Breakdown
              <span className="text-sm font-normal text-gray-600 ml-auto px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
                🖱️ Click on any umbrella to view course history
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <p className="text-gray-600">Loading credit breakdown...</p>
            )}
            {error && !isLoading && (
              <p className="text-red-600">{error}</p>
            )}
            {!isLoading && !error && Object.keys(categoryTotals).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No umbrella fields found in your profile.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please contact support if you believe this is an error.
                </p>
              </div>
            )}
            {!isLoading && !error && Object.keys(categoryTotals).length > 0 && (
              <div className="space-y-6">
                {Object.entries(categoryTotals).map(([category, totalCredits]) => (
                  <Card 
                    key={category} 
                    className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden"
                  >
                    {/* Main Category Header */}
                    <CardHeader className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                      <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                          <Award className="h-4 w-4 text-white" />
                        </div>
                        {category}
                        <span className="text-sm font-normal text-gray-600 ml-auto px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
                          Total: {totalCredits} credits ({totalCredits > 0 ? '100% Available' : '0% Available'})
                        </span>
                      </CardTitle>
                    </CardHeader>
                    
                    {/* Sub-cards Grid */}
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {groupedUmbrellas[category].map((umbrella) => {
                          const fieldKey = umbrella.replace(/\s+/g, '_');
                          const credits = Number(creditData?.[fieldKey]) || 0;
                          
                          return (
                            <Card 
                              key={umbrella}
                              className={`bg-gray-50 border transition-all duration-300 cursor-pointer rounded-lg overflow-hidden group hover:shadow-md hover:bg-gray-100 ${
                                credits > 0
                                  ? 'border-gray-300 hover:border-gray-400'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleCardClick(umbrella, fieldKey)}
                            >
                              {/* Subtle top accent */}
                              <div className={`absolute top-0 left-0 w-full h-0.5 ${
                                credits > 0 ? 'bg-blue-400' : 'bg-gray-300'
                              }`}></div>
                              
                              <CardHeader className="pb-2 pt-3">
                                <CardTitle className="text-xs font-semibold text-gray-900 group-hover:text-gray-700 transition-colors text-center">
                                  {umbrella}
                                </CardTitle>
                              </CardHeader>
                              
                              <CardContent className="pt-0 pb-3">
                                <div className="text-center">
                                  <div className={`text-xl font-bold mb-1 ${
                                    credits > 0 
                                      ? 'text-gray-900' 
                                      : 'text-gray-400'
                                  }`}>
                                    {credits}
                                  </div>
                                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                                    credits > 0 
                                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}>
                                    {credits > 0 ? '100% Available' : '0% Available'}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course History Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gray-900 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUmbrella} Course History</h2>
                    <p className="text-gray-300">Detailed view of your courses and credits</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {isLoadingHistory && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading course history...</p>
                </div>
              )}

              {historyError && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Course History</h3>
                  <p className="text-red-600 mb-4">{historyError}</p>
                  <button
                    onClick={() => fetchCourseHistory(selectedUmbrella?.replace(/\s+/g, '_') || '')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {courseHistory && !isLoadingHistory && !historyError && (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                      Summary Overview
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <Award className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-gray-900 font-semibold">{courseHistory.summary.totalCourses}</p>
                          <p className="text-gray-600 text-xs">Courses</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-gray-900 font-semibold">{courseHistory.summary.totalCredits}</p>
                          <p className="text-gray-600 text-xs">Credits</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <Clock className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-gray-900 font-semibold">{courseHistory.summary.totalHours}</p>
                          <p className="text-gray-600 text-xs">Hours</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-gray-900 font-semibold">{courseHistory.summary.totalDays}</p>
                          <p className="text-gray-600 text-xs">Days</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Detailed Credit Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-600 rounded-full"></div>
                        Credit Breakdown
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-700 font-semibold">Theory Credits:</span>
                          <span className="text-gray-900 font-bold ml-2 text-lg">{Math.round(courseHistory.summary.totalTheoryCredits || 0)}</span>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-700 font-semibold">Practical Credits:</span>
                          <span className="text-gray-900 font-bold ml-2 text-lg">{Math.round(courseHistory.summary.totalPracticalCredits || 0)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Backend Note */}
                    {courseHistory.summary.note && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <p className="text-gray-700 font-medium">{courseHistory.summary.note}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Course List */}
                  {courseHistory.courses.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-900 text-xl flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                        Course History & Credit Status
                      </h4>
                      {courseHistory.courses.map((course) => (
                        <div key={course._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                          <h5 className="font-bold text-gray-900 text-lg mb-3">{course.name}</h5>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
                            <Building className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{course.organization}</span>
                          </div>
                          
                          {/* Credit Status Indicator */}
                          <div className={`mb-3 p-3 rounded-lg border text-sm font-medium ${
                            course.isFullyAvailable 
                              ? 'bg-gray-50 border-gray-300 text-gray-800' 
                              : course.remainingTotalCredits > 0 
                                ? 'bg-gray-50 border-gray-300 text-gray-800'
                                : 'bg-gray-50 border-gray-300 text-gray-800'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {course.isFullyAvailable ? (
                                <span className="font-bold">✅ 100% Available</span>
                              ) : course.remainingTotalCredits > 0 ? (
                                <span className="font-bold">⚠️ {Math.round(((course.remainingTotalCredits || 0) / (course.originalTotalCredits || 1)) * 100)}% Available</span>
                              ) : (
                                <span className="font-bold">❌ 0% Available</span>
                              )}
                            </div>
                            
                            {/* Original vs Remaining Credits */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="p-2 bg-white rounded-lg border border-gray-200">
                                <p className="font-semibold text-gray-700 text-sm mb-1">Original Credits:</p>
                                <p className="text-gray-900 text-sm">Theory: {Math.round(course.originalTheoryCredits || 0)}</p>
                                <p className="text-gray-900 text-sm">Practical: {Math.round(course.originalPracticalCredits || 0)}</p>
                                <p className="font-bold text-gray-900 text-base">Total: {Math.round(course.originalTotalCredits || 0)}</p>
                              </div>
                              <div className="p-2 bg-white rounded-lg border border-gray-200">
                                <p className="font-semibold text-gray-700 text-sm mb-1">Remaining Credits:</p>
                                <p className="text-gray-900 text-sm">Theory: {Math.round(course.remainingTheoryCredits || 0)}</p>
                                <p className="text-gray-900 text-sm">Practical: {Math.round(course.remainingPracticalCredits || 0)}</p>
                                <p className="font-bold text-gray-900 text-base">Total: {Math.round((course.remainingTheoryCredits || 0) + (course.remainingPracticalCredits || 0))}</p>
                              </div>
                            </div>
                            
                            {/* Credits Used */}
                            {course.creditsUsed > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-300">
                                <div className="p-2 bg-white rounded-lg border border-gray-200">
                                  <p className="font-bold text-gray-800">
                                    Credits Used: {Math.round(course.creditsUsed)} 
                                    <span className="text-sm font-normal text-gray-600 ml-2">
                                      ({Math.round(((course.creditsUsed || 0) / (course.originalTotalCredits || 1)) * 100)}% of total)
                                    </span>
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Course Details */}
                          <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mt-3">
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                              <Calendar className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-gray-700">{course.noOfDays} days</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                              <Clock className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-gray-700">{course.totalHours} hours</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                              <Award className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-gray-700">{Math.round((course.remainingTheoryCredits || 0) + (course.remainingPracticalCredits || 0))} credits</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 font-medium text-center">
                              🎓 Completed: {new Date(course.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg">No courses found for this umbrella field</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug information for development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
                          <p>Available umbrellas: {umbrellas.map(u => u.name).join(', ')}</p>
              <p>Credit fields: {creditData ? Object.keys(creditData).join(', ') : 'None'}</p>
              <p>Grouped categories: {Object.keys(groupedUmbrellas).join(', ')}</p>
              <p>Category totals: {JSON.stringify(categoryTotals)}</p>
              <p>Selected umbrella: {selectedUmbrella || 'None'}</p>
              <p>Course history loaded: {courseHistory ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};