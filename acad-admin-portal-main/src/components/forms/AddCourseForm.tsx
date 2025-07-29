import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ID: "",
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
    if (!formData.ID || !formData.courseName || !formData.organization || !formData.duration || !formData.field || !formData.startDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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
          <BookOpen className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Add New Course</h1>
          <p className="text-muted-foreground">Create a new course offering</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>
            Enter the details for the new course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ID">Course ID *</Label>
                <Input
                  id="ID"
                  name="ID"
                  placeholder="Enter unique course ID"
                  value={formData.ID}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name *</Label>
                <Input
                  id="courseName"
                  name="courseName"
                  placeholder="Enter course name"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  name="organization"
                  placeholder="Enter organization name"
                  value={formData.organization}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  name="duration"
                  placeholder="e.g., 6 months, 1 year"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indoorCredits">Indoor Credits</Label>
                <Input
                  id="indoorCredits"
                  name="indoorCredits"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.indoorCredits}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outdoorCredits">Outdoor Credits</Label>
                <Input
                  id="outdoorCredits"
                  name="outdoorCredits"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.outdoorCredits}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completionStatus">Completion Status</Label>
                <Select 
                  value={formData.completionStatus} 
                  onValueChange={(value) => handleSelectChange("completionStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">Field *</Label>
                <Input
                  id="field"
                  name="field"
                  placeholder="Enter the field/domain of the course"
                  value={formData.field}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>



            {/* Subjects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Subjects *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSubject}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Subject
                </Button>
              </div>
              
              {subjects.map((subject, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Subject {index + 1}</h4>
                    {subjects.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSubject(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`noOfPeriods-${index}`}>No. of Periods *</Label>
                      <Input
                        id={`noOfPeriods-${index}`}
                        type="number"
                        min="1"
                        value={subject.noOfPeriods}
                        onChange={(e) => handleSubjectChange(index, 'noOfPeriods', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`periodsMin-${index}`}>Periods Min *</Label>
                      <Input
                        id={`periodsMin-${index}`}
                        type="number"
                        min="1"
                        value={subject.periodsMin}
                        onChange={(e) => handleSubjectChange(index, 'periodsMin', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`totalMins-${index}`}>Total Minutes *</Label>
                      <Input
                        id={`totalMins-${index}`}
                        type="number"
                        min="1"
                        value={subject.totalMins}
                        onChange={(e) => handleSubjectChange(index, 'totalMins', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`totalHrs-${index}`}>Total Hours *</Label>
                      <Input
                        id={`totalHrs-${index}`}
                        type="number"
                        min="1"
                        value={subject.totalHrs}
                        onChange={(e) => handleSubjectChange(index, 'totalHrs', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`credits-${index}`}>Credits</Label>
                      <Input
                        id={`credits-${index}`}
                        type="number"
                        min="0"
                        value={subject.credits}
                        onChange={(e) => handleSubjectChange(index, 'credits', e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
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