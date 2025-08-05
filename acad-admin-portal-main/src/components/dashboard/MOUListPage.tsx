import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ArrowLeft, Calendar, Building, Target, GraduationCap, Filter } from "lucide-react";
import { useMOU } from "@/hooks/useMOU";
import { useMOUOrganizations } from "@/hooks/useMOUOrganizations";
import { useMOUSearch } from "@/hooks/useMOUSearch";
import { useMOUSearchBySchool } from "@/hooks/useMOUSearchBySchool";
import { useSchoolsFromAPI1 } from "@/hooks/useSchoolsFromAPI1";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const MOUListPage = () => {
  const { mous, loading, error, refetch } = useMOU();
  const { organizations, loading: orgLoading, error: orgError, fetchOrganizations } = useMOUOrganizations();
  const { searchResults, loading: searchLoading, error: searchError, searchMOUByOrganization } = useMOUSearch();
  const { searchResults: schoolSearchResults, loading: schoolSearchLoading, error: schoolSearchError, searchMOUBySchool } = useMOUSearchBySchool();
  const { schools, loading: schoolsLoading, error: schoolsError, fetchSchools } = useSchoolsFromAPI1();
  const navigate = useNavigate();
  
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string>('');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [displayedMous, setDisplayedMous] = useState<any[]>([]);

  // Fetch organizations and schools on component mount
  useEffect(() => {
    fetchOrganizations();
    fetchSchools();
  }, [fetchOrganizations, fetchSchools]);

  // Update displayed MOUs based on filter
  useEffect(() => {
    if (selectedOrganization) {
      setDisplayedMous(searchResults);
    } else if (selectedSchool) {
      setDisplayedMous(schoolSearchResults);
    } else {
      setDisplayedMous(mous);
    }
  }, [selectedOrganization, selectedSchool, searchResults, schoolSearchResults, mous]);

  // Handle organization selection
  const handleOrganizationSelect = (org: string) => {
    setSelectedOrganization(org);
    setSelectedSchool(''); // Clear school selection
    if (org) {
      searchMOUByOrganization(org);
    }
  };

  // Handle school selection
  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId);
    setSelectedOrganization(''); // Clear organization selection
    if (schoolId) {
      searchMOUBySchool(schoolId);
    }
  };

  // Clear filter
  const clearFilter = () => {
    setSelectedFilterType('');
    setSelectedOrganization('');
    setSelectedSchool('');
    setShowFilter(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            <h1 className="text-2xl font-bold text-black">All MOUs</h1>
            <p className="text-gray-700">Loading MOU data...</p>
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

  if (error) {
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
            <h1 className="text-2xl font-bold text-black">All MOUs</h1>
            <p className="text-gray-700">Error loading MOU data</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-800 mb-4">{error}</p>
            <Button onClick={refetch}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-black">All MOUs</h1>
            <p className="text-gray-700">
              {displayedMous.length} memorandum{displayedMous.length !== 1 ? 's' : ''} of understanding
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
            <CardTitle className="text-lg font-bold text-gray-900">Filter MOUs</CardTitle>
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
                    <SelectItem value="school" className="text-gray-900 font-medium">Schools from API1</SelectItem>
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

              {selectedFilterType === 'school' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Schools from API1</label>
                  <Select 
                    value={selectedSchool} 
                    onValueChange={handleSchoolSelect}
                    disabled={schoolsLoading}
                  >
                    <SelectTrigger className="text-gray-900 font-medium">
                      <SelectValue placeholder={schoolsLoading ? "Loading..." : "Select school"} />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school._id} value={school._id} className="text-gray-900 font-medium">
                          {school.name} ({school.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}


            </div>
            
            <div className="flex gap-2">
                              <Button
                  variant="outline"
                  onClick={clearFilter}
                  disabled={!selectedFilterType}
                  className="font-semibold text-gray-900"
                >
                  Clear Filter
                </Button>
              {(selectedOrganization || selectedSchool) && (
                <span className="text-sm text-gray-800 flex items-center font-medium">
                  Filtered by: <span className="font-semibold ml-1 text-gray-900">
                    {selectedOrganization || 
                     (selectedSchool && schools.find(s => s._id === selectedSchool)?.name)}
                  </span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Loading Indicator */}
      {(searchLoading && selectedOrganization) || (schoolSearchLoading && selectedSchool) && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2 mx-auto"></div>
              <div className="h-6 bg-muted rounded w-1/2 mb-4 mx-auto"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Loading/Error States */}
      {(orgLoading || schoolsLoading) && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Loading filter options...</p>
          </CardContent>
        </Card>
      )}

      {(orgError || schoolsError) && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{orgError || schoolsError}</p>
            <Button onClick={() => { fetchOrganizations(); fetchSchools(); }}>Retry Loading Filters</Button>
          </CardContent>
        </Card>
      )}

      {/* Search Error Display */}
      {(searchError && selectedOrganization) && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{searchError}</p>
            <Button onClick={() => searchMOUByOrganization(selectedOrganization)}>Retry Search</Button>
          </CardContent>
        </Card>
      )}

      {/* School Search Error Display */}
      {(schoolSearchError && selectedSchool) && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{schoolSearchError}</p>
            <Button onClick={() => searchMOUBySchool(selectedSchool)}>Retry Search</Button>
          </CardContent>
        </Card>
      )}

      {/* MOU List */}
      <div className="grid gap-4">
        {displayedMous.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">
                {(selectedOrganization || selectedSchool) ? 'No MOUs Found for Selected Filter' : 'No MOUs Found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {(selectedOrganization || selectedSchool)
                  ? `No memorandums of understanding found for "${selectedOrganization || 
                     (selectedSchool && schools.find(s => s._id === selectedSchool)?.name)}".`
                  : 'No memorandums of understanding have been created yet.'
                }
              </p>
              {(selectedOrganization || selectedSchool) ? (
                <Button onClick={clearFilter}>Clear Filter</Button>
              ) : (
                <Button onClick={() => navigate('/dashboard/add-mou')}>
                  Create First MOU
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          displayedMous.map((mou) => (
            <Card key={mou._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2 text-black">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {mou.ID}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-gray-800">
                      {mou.nameOfPartnerInstitution}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">School:</span>
                    <span className="text-sm font-medium text-black">{mou.school?.name || mou.school}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Strategic Areas:</span>
                    <span className="text-sm font-medium text-black">{mou.strategicAreas}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Date of Signing:</span>
                    <span className="text-sm font-medium text-black">{formatDate(mou.dateOfSigning)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Validity:</span>
                    <span className="text-sm font-medium text-black">{mou.validity}</span>
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Affiliation Date:</span>
                    <span className="text-sm font-medium text-black">{formatDate(mou.affiliationDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MOUListPage; 