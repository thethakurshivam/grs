import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSchools } from "@/hooks/useSchools";
import { useStrategicAreas } from "@/hooks/useStrategicAreas";
import { FileText, Calendar, Building } from "lucide-react";

const AddMOUForm = () => {
  const { toast } = useToast();
  const { schools, loading: schoolsLoading, error: schoolsError, fetchSchools } = useSchools();
  const { strategicAreas, loading: strategicAreasLoading, error: strategicAreasError, fetchStrategicAreas } = useStrategicAreas();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ID: "",
    school: "",
    nameOfPartnerInstitution: "",
    strategicAreas: "",
    dateOfSigning: "",
    validity: "",
    affiliationDate: ""
  });

  // Fetch schools and strategic areas on component mount
  useEffect(() => {
    console.log('AddMOUForm: Fetching schools and strategic areas...');
    fetchSchools();
    fetchStrategicAreas();
  }, [fetchSchools, fetchStrategicAreas]);

  // Debug logging
  useEffect(() => {
    console.log('AddMOUForm: Schools data:', schools);
    console.log('AddMOUForm: Schools loading:', schoolsLoading);
    console.log('AddMOUForm: Schools error:', schoolsError);
  }, [schools, schoolsLoading, schoolsError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ID || !formData.school || !formData.nameOfPartnerInstitution || !formData.strategicAreas || !formData.dateOfSigning || !formData.validity || !formData.affiliationDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate date format
    const signingDate = new Date(formData.dateOfSigning);
    if (isNaN(signingDate.getTime())) {
      toast({
        title: "Error",
        description: "Please enter a valid date for Date of Signing",
        variant: "destructive",
      });
      return;
    }

    // Validate affiliation date format
    const affiliationDateObj = new Date(formData.affiliationDate);
    if (isNaN(affiliationDateObj.getTime())) {
      toast({
        title: "Error",
        description: "Please enter a valid date for Affiliation Date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get authentication token
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again to continue",
          variant: "destructive",
        });
        return;
      }

      // API call to backend POST MOU endpoint
              const response = await fetch('http://localhost:3000/admin/mous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ID: formData.ID,
          school: formData.school,
          nameOfPartnerInstitution: formData.nameOfPartnerInstitution,
          strategicAreas: formData.strategicAreas,
          dateOfSigning: formData.dateOfSigning,
          validity: formData.validity,
          affiliationDate: formData.affiliationDate
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "MOU has been created successfully!",
        });

        // Reset form
        setFormData({
          ID: "",
          school: "",
          nameOfPartnerInstitution: "",
          strategicAreas: "",
          dateOfSigning: "",
          validity: "",
          affiliationDate: ""
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create MOU. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('MOU creation error:', error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <FileText className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-black">Add New MOU</h1>
          <p className="text-black">Create a new Memorandum of Understanding</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-black">MOU Details</CardTitle>
          <CardDescription className="text-black">
            Enter the details for the new MOU partnership
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mou-id" className="text-black font-semibold">MOU ID *</Label>
                <Input
                  id="mou-id"
                  name="ID"
                  placeholder="Enter unique MOU ID"
                  value={formData.ID}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school-select" className="text-black font-semibold">School *</Label>
                <Select 
                  value={formData.school} 
                  onValueChange={(value) => handleSelectChange("school", value)}
                  disabled={schoolsLoading}
                >
                  <SelectTrigger id="school-select" className="w-full text-black">
                    <SelectValue placeholder={schoolsLoading ? "Loading schools..." : "Select school"} />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school._id} value={school._id} className="text-black">
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {schoolsError && (
                  <p className="text-red-600 text-sm">{schoolsError}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner-institution" className="text-black font-semibold">Partner Institution Name *</Label>
              <Input
                id="partner-institution"
                name="nameOfPartnerInstitution"
                placeholder="Enter partner institution name"
                value={formData.nameOfPartnerInstitution}
                onChange={handleInputChange}
                required
                className="text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategic-areas-select" className="text-black font-semibold">Strategic Areas *</Label>
              <Select 
                value={formData.strategicAreas} 
                onValueChange={(value) => handleSelectChange("strategicAreas", value)}
                disabled={strategicAreasLoading}
              >
                <SelectTrigger id="strategic-areas-select" className="w-full text-black">
                  <SelectValue placeholder={strategicAreasLoading ? "Loading strategic areas..." : "Select strategic areas"} />
                </SelectTrigger>
                <SelectContent>
                  {strategicAreas.map((area) => (
                    <SelectItem key={area._id} value={area.name} className="text-black">
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {strategicAreasError && (
                <p className="text-red-600 text-sm">{strategicAreasError}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-of-signing" className="text-black font-semibold">Date of Signing *</Label>
                <Input
                  id="date-of-signing"
                  name="dateOfSigning"
                  type="date"
                  value={formData.dateOfSigning}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validity-period" className="text-black font-semibold">Validity *</Label>
                <Input
                  id="validity-period"
                  name="validity"
                  placeholder="e.g., 5 years, 2025-2030"
                  value={formData.validity}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="affiliation-date" className="text-black font-semibold">Affiliation Date *</Label>
                <Input
                  id="affiliation-date"
                  name="affiliationDate"
                  type="date"
                  value={formData.affiliationDate}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Creating MOU..." : "Create MOU"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" disabled={isLoading}>
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMOUForm;