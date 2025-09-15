import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, ArrowLeft, Calendar, Building, Target, Clock, GraduationCap, FileText, Hash, Award, School, Filter } from "lucide-react";
import { useCompletedCourses } from "@/hooks/useCompletedCourses";
import { useMOU } from "@/hooks/useMOU";
import { useCourseOrganizations } from "@/hooks/useCourseOrganizations";
import { useCourseSearchByOrganization } from "@/hooks/useCourseSearchByOrganization";
import { useCourseSearchByMOU } from "@/hooks/useCourseSearchByMOU";
import { useMOU as useMOUList } from "@/hooks/useMOU";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const CompletedCoursesListPage = () => {
  // Add error state for component-level errors
  const [componentError, setComponentError] = useState<string | null>(null);
  
  const { courses, loading, error, refetch } = useCompletedCourses();
  const { fetchMOUById } = useMOU();
  const { organizations, loading: orgLoading, error: orgError } = useCourseOrganizations();
  const { courses: orgCourses, loading: orgSearchLoading, error: orgSearchError, searchByOrganization } = useCourseSearchByOrganization();
  const { courses: mouCourses, loading: mouSearchLoading, error: mouSearchError, searchByMOU } = useCourseSearchByMOU();
  const { mous, loading: mousLoading, error: mousError } = useMOUList();
  const navigate = useNavigate();
  const [mouDetails, setMouDetails] = useState<{[key: string]: any}>({});
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string>('');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [selectedMOU, setSelectedMOU] = useState<string>('');
  const [displayedCourses, setDisplayedCourses] = useState<any[]>([]);

  // Add error boundary and debugging
  useEffect(() => {
    console.log('CompletedCoursesListPage: Component mounted');
    console.log('CompletedCoursesListPage: Auth token exists:', !!localStorage.getItem('authToken'));
  }, []);

  // Add error handling for courses data
  useEffect(() => {
    console.log('CompletedCoursesListPage: Courses data:', courses);
    console.log('CompletedCoursesListPage: Loading state:', loading);
    console.log('CompletedCoursesListPage: Error state:', error);
  }, [courses, loading, error]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch MOU details for all courses
  useEffect(() => {
    const fetchMOUDetails = async () => {
      const details: {[key: string]: any} = {};
      
      for (const course of displayedCourses) {
        if (course.mou_id && !mouDetails[course.mou_id]) {
          const mou = await fetchMOUById(course.mou_id);
          if (mou) {
            details[course.mou_id] = mou;
          }
        }
      }
      
      setMouDetails(prev => ({ ...prev, ...details }));
    };

    if (displayedCourses.length > 0) {
      fetchMOUDetails();
    }
  }, [displayedCourses, fetchMOUById]);

  // Initialize displayed courses when courses loads
  useEffect(() => {
    if (courses && Array.isArray(courses) && courses.length > 0) {
      setDisplayedCourses(courses);
    } else if (courses && Array.isArray(courses)) {
      setDisplayedCourses([]);
    }
  }, [courses]);

  // Update displayed courses based on filter
  useEffect(() => {
    if (selectedFilterType === 'organization' && selectedOrganization) {
      setDisplayedCourses(orgCourses);
    } else if (selectedFilterType === 'mou' && selectedMOU) {
      setDisplayedCourses(mouCourses);
    } else if (courses) {
      setDisplayedCourses(courses);
    }
  }, [selectedFilterType, selectedOrganization, selectedMOU, orgCourses, mouCourses, courses]);

  // Handle organization selection
  const handleOrganizationSelect = (organization: string) => {
    setSelectedOrganization(organization);
    setSelectedMOU('');
    searchByOrganization(organization, 'completed');
  };

  // Handle MOU selection
  const handleMOUSelect = (mouId: string) => {
    setSelectedMOU(mouId);
    setSelectedOrganization('');
    searchByMOU(mouId, 'completed');
  };

  // Clear filter
  const clearFilter = () => {
    setSelectedFilterType('');
    setSelectedOrganization('');
    setSelectedMOU('');
    setDisplayedCourses(courses);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black">Completed Courses</h1>
            <p className="text-black">Loading completed courses data...</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Add error boundary for unexpected errors
  if (error || componentError) {
    console.error('CompletedCoursesListPage: Error occurred:', error || componentError);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black">Completed Courses</h1>
            <p className="text-black">Error loading completed courses data</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-black mb-4">
              {(error || componentError)?.includes('authentication') || (error || componentError)?.includes('token') 
                ? 'Please log in again to access this page.' 
                : error || componentError}
            </p>
            <div className="space-y-2">
              <Button onClick={() => {
                setComponentError(null);
                refetch();
              }}>Retry</Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wrap the main render in try-catch to prevent crashes
  try {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black">Completed Courses</h1>
            <p className="text-black">
              {displayedCourses.length} completed course{displayedCourses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filter Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 text-gray-900 font-semibold"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
              </div>

      {/* Filter Section */}
      {showFilter && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Filter Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Filter Type</label>
                <Select
                  value={selectedFilterType}
                  onValueChange={(value) => setSelectedFilterType(value)}
                >
                  <SelectTrigger className="text-gray-900 font-medium">
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organization" className="text-gray-900 font-medium">Organization</SelectItem>
                    <SelectItem value="mou" className="text-gray-900 font-medium">MOU</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedFilterType === 'organization' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Organization</label>
                  <Select
                    value={selectedOrganization}
                    onValueChange={handleOrganizationSelect}
                    disabled={orgLoading}
                  >
                    <SelectTrigger className="text-gray-900 font-medium">
                      <SelectValue placeholder={orgLoading ? "Loading..." : "Select organization"} />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org} value={org} className="text-gray-900 font-medium">
                          {org}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedFilterType === 'mou' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">MOU</label>
                  <Select
                    value={selectedMOU}
                    onValueChange={handleMOUSelect}
                    disabled={mousLoading}
                  >
                    <SelectTrigger className="text-gray-900 font-medium">
                      <SelectValue placeholder={mousLoading ? "Loading..." : "Select MOU"} />
                    </SelectTrigger>
                    <SelectContent>
                      {mous.map((mou) => (
                        <SelectItem key={mou._id} value={mou._id} className="text-gray-900 font-medium">
                          {mou.nameOfPartnerInstitution}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearFilter}
                  disabled={!selectedFilterType}
                  className="font-semibold text-gray-900"
                >
                  Clear Filter
                </Button>
                {(selectedOrganization || selectedMOU) && (
                  <span className="text-sm text-gray-800 flex items-center font-medium">
                    Filtered by: <span className="font-semibold ml-1 text-gray-900">
                      {selectedOrganization ||
                       (selectedMOU && mous.find(m => m._id === selectedMOU)?.nameOfPartnerInstitution)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading and Error States for Filter */}
      {(orgLoading || mousLoading || orgSearchLoading || mouSearchLoading) && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-black">Loading filter options...</p>
          </CardContent>
        </Card>
      )}

      {(orgError || mousError || orgSearchError || mouSearchError) && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">
              {orgError || mousError || orgSearchError || mouSearchError}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Courses List */}
      <div className="grid gap-4">
        {displayedCourses.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-black">
                {selectedFilterType ? 'No Filtered Courses Found' : 'No Completed Courses Found'}
              </h3>
              <p className="text-black mb-4">
                {selectedFilterType 
                  ? `No completed courses found for the selected ${selectedFilterType === 'organization' ? 'organization' : 'MOU'}.`
                  : 'No completed courses have been found in the system.'
                }
              </p>
              {!selectedFilterType && (
                <Button onClick={() => navigate('/dashboard/add-course')}>
                  Add First Course
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          displayedCourses.map((course) => {
            // Add error handling for individual course rendering
            if (!course || !course._id) {
              console.warn('Invalid course data:', course);
              return null;
            }
            
            return (
            <Card key={course._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2 text-black">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      {course.courseName}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-black">
                      {course.organization}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Target className="h-3 w-3" />
                    {course.completionStatus}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Course ID:</span>
                    <span className="text-sm font-medium text-black">{course.ID}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Field:</span>
                    <span className="text-sm font-medium text-black">
                      {typeof course.field === 'object' && course.field 
                        ? course.field.name || 'N/A'
                        : course.field || 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Start Date:</span>
                    <span className="text-sm font-medium text-black">{formatDate(course.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Duration:</span>
                    <span className="text-sm font-medium text-black">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Indoor Credits:</span>
                    <span className="text-sm font-medium text-black">{course.indoorCredits}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">Outdoor Credits:</span>
                    <span className="text-sm font-medium text-black">{course.outdoorCredits}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">MOU ID:</span>
                    <span className="text-sm font-medium text-black">{course.mou_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">MOU Name:</span>
                    <span className="text-sm font-medium text-black">{mouDetails[course.mou_id]?.nameOfPartnerInstitution || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-black">MOU School:</span>
                    <span className="text-sm font-medium text-black">
                      {mouDetails[course.mou_id]?.school?.name || 
                       (typeof mouDetails[course.mou_id]?.school === 'string' ? mouDetails[course.mou_id]?.school : 'Loading...') || 'N/A'}
                    </span>
                  </div>
                </div>
                {course.subjects && course.subjects.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-black mb-2">Subjects:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {course.subjects.map((subject, index) => (
                        <div key={index} className="text-sm text-black">
                          <p><strong>Periods:</strong> {subject.noOfPeriods}</p>
                          <p><strong>Duration:</strong> {subject.periodsMin} mins ({subject.totalHrs} hrs)</p>
                          <p><strong>Credits:</strong> {subject.credits}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
          }).filter(Boolean) // Remove null entries
        )}
      </div>
    </div>
  );
  } catch (renderError) {
    console.error('CompletedCoursesListPage: Render error:', renderError);
    setComponentError(renderError instanceof Error ? renderError.message : 'An unexpected error occurred while rendering');
    return null; // This will trigger the error boundary above
  }
};

export default CompletedCoursesListPage; 