import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard, Clock, Calendar, Award, Building } from 'lucide-react';
import useBPRNDCreditBreakdown from '@/hooks/useBPRNDCreditBreakdown';
import useBPRNDUmbrellas from '@/hooks/useBPRNDUmbrellas';

interface CourseHistoryItem {
  _id: string;
  name: string;
  organization: string;
  discipline: string;
  totalHours: number;
  noOfDays: number;
  creditsEarned: number;
  createdAt: string;
}

interface CourseHistoryResponse {
  umbrella: string;
  studentId: string;
  courses: CourseHistoryItem[];
  summary: {
    totalCourses: number;
    totalCredits: number;
    totalHours: number;
    totalDays: number;
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

  // State for hover functionality
  const [hoveredUmbrella, setHoveredUmbrella] = useState<string | null>(null);
  const [courseHistory, setCourseHistory] = useState<CourseHistoryResponse | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const onFocus = () => {
      refetchCredits();
      refetchUmbrellas();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetchCredits, refetchUmbrellas]);

  // Fetch course history when hovering over a card
  const fetchCourseHistory = async (umbrella: string) => {
    if (!studentId || !umbrella) return;

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      // Encode the umbrella name for URL (handle spaces and special characters)
      const encodedUmbrella = encodeURIComponent(umbrella);
      const response = await fetch(`http://localhost:3004/student/${studentId}/course-history/${encodedUmbrella}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course history: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCourseHistory(data.data);
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

  // Handle mouse enter on credit card
  const handleCardHover = (umbrella: string) => {
    setHoveredUmbrella(umbrella);
    fetchCourseHistory(umbrella);
  };

  // Handle mouse leave on credit card
  const handleCardLeave = () => {
    setHoveredUmbrella(null);
    setCourseHistory(null);
    setHistoryError(null);
  };

  // Filter credit data to only show umbrellas that exist in the database
  const filteredCreditEntries = useMemo(() => {
    if (!creditData || !umbrellas.length) return [];
    
    // Get umbrella names from the database
    const umbrellaNames = umbrellas.map(u => u.name);
    
    // Filter credit data to only include existing umbrella fields
    return Object.entries(creditData)
      .filter(([key, value]) => {
        // Check if this credit field corresponds to an existing umbrella
        const normalizedKey = key.replace(/_/g, ' ');
        return umbrellaNames.some(umbrellaName => 
          normalizedKey.toLowerCase() === umbrellaName.toLowerCase() ||
          key.toLowerCase() === umbrellaName.toLowerCase()
        );
      })
      // Show all umbrella fields, even with 0 credits
      .sort(([a], [b]) => a.localeCompare(b)); // Sort alphabetically
  }, [creditData, umbrellas]);

  const isLoading = creditsLoading || umbrellasLoading;
  const error = creditsError || umbrellasError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Credit Bank</h1>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-gray-700">View your credit breakdown by umbrella field.</p>
            {!isLoading && umbrellas.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {filteredCreditEntries.length} of {umbrellas.length} umbrella fields available
              </p>
            )}
          </div>
          <button
            onClick={() => {
              refetchCredits();
              refetchUmbrellas();
            }}
            className="text-sm text-[#0b2e63] hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Cards Section - Fixed width, no layout shifts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-[#0b2e63]" />
                Credit Breakdown
                {hoveredUmbrella && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (Hovering over: {hoveredUmbrella})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <p className="text-gray-600">Loading credit breakdown...</p>
              )}
              {error && !isLoading && (
                <p className="text-red-600">{error}</p>
              )}
              {!isLoading && !error && filteredCreditEntries.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No umbrella fields found in your profile.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Please contact support if you believe this is an error.
                  </p>
                </div>
              )}
              {!isLoading && !error && filteredCreditEntries.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCreditEntries.map(([label, value]) => {
                    const title = label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                    const credits = Number(value) || 0;
                    const isHovered = hoveredUmbrella === title;
                    
                    return (
                    <Card 
                      key={label} 
                      className={`border transition-colors duration-200 cursor-pointer ${
                        isHovered 
                          ? 'border-[#0b2e63] shadow-md' 
                          : credits > 0
                            ? 'border-[#0b2e63]/20 hover:border-[#0b2e63]/40'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onMouseEnter={() => handleCardHover(title)}
                      onMouseLeave={handleCardLeave}
                    >
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-[#0b2e63]">{title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-xl font-semibold ${credits > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                          {credits}
                        </p>
                        <p className={`text-xs mt-1 ${credits > 0 ? 'text-gray-500' : 'text-gray-400'}`}>
                          {credits > 0 ? 'credits earned' : 'no credits yet'}
                        </p>
                      </CardContent>
                    </Card>
                  );})}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Course History Section - Always present, content changes on hover */}
        <div className="lg:col-span-1">
          <Card className="h-fit transition-opacity duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-[#0b2e63]" />
                Course History
              </CardTitle>
              <p className="text-sm text-gray-600 font-normal">
                {hoveredUmbrella || 'Hover over a credit card to view course history'}
              </p>
            </CardHeader>
              <CardContent>
                {isLoadingHistory && (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Loading course history...</p>
                  </div>
                )}

                {historyError && (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm">{historyError}</p>
                  </div>
                )}

                {courseHistory && !isLoadingHistory && !historyError && (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-[#0b2e63]" />
                          <span className="text-gray-600">{courseHistory.summary.totalCourses} courses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3 text-[#0b2e63]" />
                          <span className="text-gray-600">{courseHistory.summary.totalCredits} credits</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#0b2e63]" />
                          <span className="text-gray-600">{courseHistory.summary.totalHours} hours</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#0b2e63]" />
                          <span className="text-gray-600">{courseHistory.summary.totalDays} days</span>
                        </div>
                      </div>
                    </div>

                    {/* Course List */}
                    {courseHistory.courses.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-900">Completed Courses</h4>
                        {courseHistory.courses.map((course) => (
                          <div key={course._id} className="border border-gray-200 rounded-lg p-3 bg-white">
                            <h5 className="font-medium text-sm text-gray-900 mb-1">{course.name}</h5>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                              <Building className="h-3 w-3" />
                              <span>{course.organization}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-[#0b2e63]" />
                                <span>{course.totalHours}h</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-[#0b2e63]" />
                                <span>{course.noOfDays}d</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Award className="h-3 w-3 text-[#0b2e63]" />
                                <span>{course.creditsEarned} cr</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Completed: {new Date(course.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No courses found for this umbrella field</p>
                      </div>
                    )}
                  </div>
                )}

                {!hoveredUmbrella && !isLoadingHistory && !historyError && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Hover over any credit card to view course history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Debug information for development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            <p>Available umbrellas: {umbrellas.map(u => u.name).join(', ')}</p>
            <p>Credit fields: {creditData ? Object.keys(creditData).join(', ') : 'None'}</p>
            <p>Filtered entries: {filteredCreditEntries.length}</p>
            <p>Hovered umbrella: {hoveredUmbrella || 'None'}</p>
            <p>Course history loaded: {courseHistory ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};