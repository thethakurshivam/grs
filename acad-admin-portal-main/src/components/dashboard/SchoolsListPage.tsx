import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Building } from "lucide-react";
import { useSchools } from "@/hooks/useSchools";
import { useNavigate } from "react-router-dom";

const SchoolsListPage = () => {
  const { schools, loading, error, refetch } = useSchools();
  const navigate = useNavigate();

  const handleSchoolClick = (schoolName: string) => {
    navigate(`/dashboard/schools/${encodeURIComponent(schoolName)}`);
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
            <h1 className="text-2xl font-bold">All Schools</h1>
            <p className="text-muted-foreground">Loading schools data...</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
            <h1 className="text-2xl font-bold">All Schools</h1>
            <p className="text-muted-foreground">Error loading schools data</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-black">All Schools</h1>
          <p className="text-black">
            {schools.length} school{schools.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Schools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schools.length === 0 ? (
          <Card className="border-0 shadow-md md:col-span-2 lg:col-span-3">
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-black">No Schools Found</h3>
              <p className="text-black mb-4">
                No schools have been created yet.
              </p>
              <Button onClick={() => navigate('/dashboard/add-mou')}>
                Create First MOU
              </Button>
            </CardContent>
          </Card>
        ) : (
          schools.map((school) => (
            <Card 
              key={school.id} 
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSchoolClick(school.name)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2 text-black">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      {school.name}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-black">
                      School Information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-black">MOUs Count:</span>
                  <span className="text-sm font-medium text-black">{school.count}</span>
                </div>
                <div className="text-xs text-black">
                  Click to view all MOUs for this school
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SchoolsListPage; 