import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Calendar, Building } from "lucide-react";

const AddMOUForm = () => {
  const { toast } = useToast();
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

  // Sample fields for the dropdown
  const sampleFields = [
    "Computer Science",
    "Engineering",
    "Business Administration",
    "Medicine",
    "Arts and Humanities",
    "Social Sciences",
    "Natural Sciences",
    "Technology"
  ];

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
      const response = await fetch('http://localhost:3000/api/mous', {
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
                <Label htmlFor="ID" className="text-black font-semibold">MOU ID *</Label>
                <Input
                  id="ID"
                  name="ID"
                  placeholder="Enter unique MOU ID"
                  value={formData.ID}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school" className="text-black font-semibold">School *</Label>
                <Input
                  id="school"
                  name="school"
                  placeholder="Enter school name"
                  value={formData.school}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameOfPartnerInstitution" className="text-black font-semibold">Partner Institution Name *</Label>
              <Input
                id="nameOfPartnerInstitution"
                name="nameOfPartnerInstitution"
                placeholder="Enter partner institution name"
                value={formData.nameOfPartnerInstitution}
                onChange={handleInputChange}
                required
                className="text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategicAreas" className="text-black font-semibold">Strategic Areas *</Label>
              <Select onValueChange={(value) => handleSelectChange("strategicAreas", value)} defaultValue={formData.strategicAreas}>
                <SelectTrigger className="w-full text-black">
                  <SelectValue placeholder="Select strategic areas" />
                </SelectTrigger>
                <SelectContent>
                  {sampleFields.map((field) => (
                    <SelectItem key={field} value={field} className="text-black">
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfSigning" className="text-black font-semibold">Date of Signing *</Label>
                <Input
                  id="dateOfSigning"
                  name="dateOfSigning"
                  type="date"
                  value={formData.dateOfSigning}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validity" className="text-black font-semibold">Validity *</Label>
                <Input
                  id="validity"
                  name="validity"
                  placeholder="e.g., 5 years, 2025-2030"
                  value={formData.validity}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="affiliationDate" className="text-black font-semibold">Affiliation Date *</Label>
                <Input
                  id="affiliationDate"
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