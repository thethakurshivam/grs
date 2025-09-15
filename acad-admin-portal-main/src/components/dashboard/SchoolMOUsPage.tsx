import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Calendar, Building, Target, GraduationCap } from "lucide-react";
import { useSchoolMOUs } from "@/hooks/useSchoolMOUs";
import { useNavigate, useParams } from "react-router-dom";

const SchoolMOUsPage = () => {
  const { schoolName } = useParams<{ schoolName: string }>();
  const decodedSchoolName = schoolName ? decodeURIComponent(schoolName) : '';
  const { mous, school, loading, error, refetch } = useSchoolMOUs(decodedSchoolName);
  const navigate = useNavigate();

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
            onClick={() => navigate('/dashboard/schools')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black">School MOUs</h1>
            <p className="text-gray-700">Loading MOUs data...</p>
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
            onClick={() => navigate('/dashboard/schools')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black">School MOUs</h1>
            <p className="text-gray-700">Error loading MOUs data</p>
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
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/schools')}
          className="hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-black">School MOUs</h1>
          <p className="text-gray-700">
            {school?.name} - {mous.length} MOU{mous.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* MOUs List */}
      <div className="grid gap-4">
        {mous.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">No MOUs Found</h3>
              <p className="text-gray-600 mb-4">
                No memorandums of understanding found for {school?.name}.
              </p>
              <Button onClick={() => navigate('/dashboard/add-mou')}>
                Create First MOU
              </Button>
            </CardContent>
          </Card>
        ) : (
          mous.map((mou) => (
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
                    <span className="text-sm font-medium text-black">{mou.school}</span>
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

export default SchoolMOUsPage; 