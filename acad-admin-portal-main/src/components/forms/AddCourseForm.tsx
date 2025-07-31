import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMOU } from "@/hooks/useMOU";
import { BookOpen, Plus, Trash2 } from "lucide-react";

interface Subject {
  noOfPeriods: number;
  periodsMin: number;
  totalMins: number;
  totalHrs: number;
  credits: number;
}

const AddCourseForm = () => {
  const { toast } = useToast();
  const { mous, loading: mousLoading, error: mousError } = useMOU();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ID: "",
    mou_id: "",
    courseName: "",
    organization: "",
    duration: "",
    indoorCredits: 0,
    outdoorCredits: 0,
    field: "",
    startDate: "",
    completionStatus: "upcoming"
  });
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      noOfPeriods: 1,
      periodsMin: 1,
      totalMins: 1,
      totalHrs: 1,
      credits: 0
    }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'indoorCredits' || name === 'outdoorCredits' ? parseInt(value) || 0 : value.trim()
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (index: number, field: keyof Subject, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = {
      ...newSubjects[index],
      [field]: parseInt(value) || 0
    };
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, {
      noOfPeriods: 1,
      periodsMin: 1,
      totalMins: 1,
      totalHrs: 1,
      credits: 0
    }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ID || !formData.mou_id || !formData.courseName || !formData.organization || !formData.duration || !formData.field || !formData.startDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including MOU selection",
        variant: "destructive",
      });
      return;
    }

    if (formData.indoorCredits < 0 || formData.outdoorCredits < 0) {
      toast({
        title: "Error",
        description: "Credits must be non-negative numbers",
        variant: "destructive",
      });
      return;
    }

    // Validate start date
    const startDateObj = new Date(formData.startDate);
    if (isNaN(startDateObj.getTime())) {
      toast({
        title: "Error",
        description: "Please enter a valid start date",
        variant: "destructive",
      });
      return;
    }

    // Validate subjects
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      if (subject.noOfPeriods < 1 || subject.periodsMin < 1 || subject.totalMins < 1 || subject.totalHrs < 1 || subject.credits < 0) {
        toast({
          title: "Error",
          description: `Subject ${i + 1}: All values must be positive numbers, credits must be non-negative`,
          variant: "destructive",
        });
        return;
      }
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

      // API call to backend add course endpoint
      const response = await fetch('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ID: formData.ID.trim(),
          mou_id: formData.mou_id,
          courseName: formData.courseName.trim(),
          organization: formData.organization.trim(),
          duration: formData.duration.trim(),
          indoorCredits: formData.indoorCredits,
          outdoorCredits: formData.outdoorCredits,
          field: formData.field.trim(),
          startDate: formData.startDate,
          completionStatus: formData.completionStatus,
          subjects: subjects
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "Course has been created successfully!",
        });

        // Reset form
        setFormData({
          ID: "",
          mou_id: "",
          courseName: "",
          organization: "",
          duration: "",
          indoorCredits: 0,
          outdoorCredits: 0,
          field: "",
          startDate: "",
          completionStatus: "upcoming"
        });
        setSubjects([{
          noOfPeriods: 1,
          periodsMin: 1,
          totalMins: 1,
          totalHrs: 1,
          credits: 0
        }]);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create course. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Course creation error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while MOUs are being fetched
  if (mousLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Add New Course
          </CardTitle>
          <CardDescription>
            Create a new course with all required details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading MOUs...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if MOUs failed to load
  if (mousError) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Add New Course
          </CardTitle>
          <CardDescription>
            Create a new course with all required details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading MOUs: {mousError}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <BookOpen className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-black">Add New Course</h1>
          <p className="text-black">Create a new course for the university</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-black">Course Details</CardTitle>
          <CardDescription className="text-black">
            Enter the details for the new course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseName" className="text-black font-semibold">Course Name *</Label>
                <Input
                  id="courseName"
                  name="courseName"
                  placeholder="Enter course name"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mou_id" className="text-black font-semibold">MOU *</Label>
                <Select onValueChange={(value) => handleSelectChange("mou_id", value)} defaultValue={formData.mou_id}>
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Select MOU" />
                  </SelectTrigger>
                  <SelectContent>
                    {mousLoading ? (
                      <SelectItem value="" disabled>Loading MOUs...</SelectItem>
                    ) : mousError ? (
                      <SelectItem value="" disabled>Error loading MOUs</SelectItem>
                    ) : (
                      mous.map((mou) => (
                        <SelectItem key={mou._id} value={mou._id} className="text-black">
                          {mou.ID} - {mou.nameOfPartnerInstitution}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field" className="text-black font-semibold">Field *</Label>
                <Input
                  id="field"
                  name="field"
                  placeholder="Enter field of study"
                  value={formData.field}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization" className="text-black font-semibold">Organization *</Label>
                <Input
                  id="organization"
                  name="organization"
                  placeholder="Enter organization name"
                  value={formData.organization}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-black font-semibold">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-black font-semibold">End Date *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completionStatus" className="text-black font-semibold">Status *</Label>
                <Select onValueChange={(value) => handleSelectChange("completionStatus", value)} defaultValue={formData.completionStatus}>
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing" className="text-black">Ongoing</SelectItem>
                    <SelectItem value="completed" className="text-black">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-black font-semibold">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter course description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="text-black"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Creating Course..." : "Create Course"}
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

export default AddCourseForm;