import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, Users } from "lucide-react";

const AddCourseForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ID: "",
    Name: "",
    eligibleDepartments: [] as string[],
    startDate: "",
    endDate: "",
    completed: "no",
    field: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "eligibleDepartments") {
      // Handle multiple department selection
      setFormData(prev => ({
        ...prev,
        eligibleDepartments: prev.eligibleDepartments.includes(value) 
          ? prev.eligibleDepartments.filter(dept => dept !== value)
          : [...prev.eligibleDepartments, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ID || !formData.Name || formData.eligibleDepartments.length === 0 || !formData.startDate || !formData.endDate || !formData.field) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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

      // API call to backend add course endpoint
      const response = await fetch('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ID: formData.ID,
          Name: formData.Name,
          eligibleDepartments: formData.eligibleDepartments,
          startDate: formData.startDate,
          endDate: formData.endDate,
          completed: formData.completed,
          field: formData.field
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
          Name: "",
          eligibleDepartments: [],
          startDate: "",
          endDate: "",
          completed: "no",
          field: ""
        });
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
                <Label htmlFor="Name">Course Name *</Label>
                <Input
                  id="Name"
                  name="Name"
                  placeholder="Enter course name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  required
                />
              </div>
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

            <div className="space-y-2">
              <Label>Eligible Departments * (Select multiple)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-md">
                {["Engineering", "Business", "Science", "Arts", "Medicine", "Law", "Computer Science", "Mathematics"].map((dept) => (
                  <label key={dept} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.eligibleDepartments.includes(dept)}
                      onChange={() => handleSelectChange("eligibleDepartments", dept)}
                      className="rounded"
                    />
                    <span className="text-sm">{dept}</span>
                  </label>
                ))}
              </div>
              {formData.eligibleDepartments.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected: {formData.eligibleDepartments.join(", ")}
                </p>
              )}
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
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completed">Completion Status</Label>
                <Select 
                  value={formData.completed} 
                  onValueChange={(value) => handleSelectChange("completed", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Not Completed</SelectItem>
                    <SelectItem value="yes">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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