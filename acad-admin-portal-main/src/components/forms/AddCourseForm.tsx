import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMOU } from "@/hooks/useMOU";
import { useFields } from "@/hooks/useFields";
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
  const { fields, loading: fieldsLoading, error: fieldsError, fetchFields } = useFields();
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
    endDate: "",
    completionStatus: "upcoming",
    description: ""
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

  // Debug logs
  useEffect(() => {
    console.log("AddCourseForm mounted");
    console.log("Auth token:", localStorage.getItem("authToken"));
    fetchFields();
    return () => {
      console.log("AddCourseForm unmounted");
    };
  }, [fetchFields]);

  // Debug logs for fields
  useEffect(() => {
    console.log("Fields state updated:", { fields, fieldsLoading, fieldsError });
  }, [fields, fieldsLoading, fieldsError]);

  // Debug logs for MOUs
  useEffect(() => {
    console.log("MOUs state updated:", { mous, mousLoading, mousError });
  }, [mous, mousLoading, mousError]);

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
      console.log('Making API request to create course');
              const response = await fetch('http://localhost:3002/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
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
          endDate: "",
          completionStatus: "upcoming",
          description: ""
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

  // Show loading state while fields are being fetched
  if (fieldsLoading) {
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
              <p>Loading Fields...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if fields failed to load
  if (fieldsError) {
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
              <p className="text-red-600 mb-4">Error loading fields: {fieldsError}</p>
              <Button onClick={() => fetchFields()}>Retry</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Debug component to show raw data
  const DebugInfo = () => (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Debug Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Fields ({fields.length}):</h4>
          <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(fields, null, 2)}</pre>
        </div>
        <div>
          <h4 className="font-semibold">MOUs ({mous.length}):</h4>
          <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(mous, null, 2)}</pre>
        </div>
      </div>
    </div>
  );

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
                <Label htmlFor="ID" className="text-black font-semibold">Course ID *</Label>
                <Input
                  id="ID"
                  name="ID"
                  placeholder="Enter course ID"
                  value={formData.ID}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-black font-semibold">Duration *</Label>
                <Input
                  id="duration"
                  name="duration"
                  placeholder="e.g., 12 weeks"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field" className="text-black font-semibold">Field *</Label>
                <Select onValueChange={(value) => handleSelectChange("field", value)} defaultValue={formData.field}>
                  <SelectTrigger className="w-full text-black">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldsLoading ? (
                      <SelectItem value="" disabled>Loading fields...</SelectItem>
                    ) : fieldsError ? (
                      <SelectItem value="" disabled>Error loading fields</SelectItem>
                    ) : (
                                              fields.filter((field) => field.name !== 'Cyber Security').map((field) => {
                          // Define umbrella categories mapping
                          const umbrellaCategories = {
                            'Police Administration': [
                              'Tourism Police',
                              'Women in Security and Police',
                              'Traffic Management and Road Safety',
                              'Border Management',
                              'Disaster Risk Reduction'
                            ],
                            'Cyber Security': [
                              'Cyber Law',
                              'Cyber Threat Intelligence',
                              'OSI Model',
                              'Social Media Security'
                            ],
                            'Forensics': [
                              'Behavioral Sciences',
                              'Forensics Psychology',
                              'Gender Sensitisation'
                            ]
                          };

                          // Find which category this field belongs to
                          let category = '';
                          Object.entries(umbrellaCategories).forEach(([cat, umbrellas]) => {
                            if (umbrellas.includes(field.name)) {
                              category = cat;
                            }
                          });

                          // Add prefix if category is found
                          const displayName = category ? `[${category}] - ${field.name}` : field.name;
                          
                          return (
                            <SelectItem key={field._id} value={field.name} className="text-black">
                              {displayName}
                            </SelectItem>
                          );
                        })
                    )}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="indoorCredits" className="text-black font-semibold">Indoor Credits</Label>
                <Input
                  id="indoorCredits"
                  name="indoorCredits"
                  type="number"
                  min="0"
                  value={formData.indoorCredits}
                  onChange={handleInputChange}
                  className="text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outdoorCredits" className="text-black font-semibold">Outdoor Credits</Label>
                <Input
                  id="outdoorCredits"
                  name="outdoorCredits"
                  type="number"
                  min="0"
                  value={formData.outdoorCredits}
                  onChange={handleInputChange}
                  className="text-black"
                />
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
                className="min-h-[100px] text-black"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-black font-semibold">Subjects</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                  <Plus className="h-4 w-4 mr-1" /> Add Subject
                </Button>
              </div>

              {subjects.map((subject, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor={`noOfPeriods-${index}`} className="text-black font-semibold">No. of Periods</Label>
                    <Input
                      id={`noOfPeriods-${index}`}
                      type="number"
                      min="1"
                      value={subject.noOfPeriods}
                      onChange={(e) => handleSubjectChange(index, 'noOfPeriods', e.target.value)}
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`periodsMin-${index}`} className="text-black font-semibold">Minutes per Period</Label>
                    <Input
                      id={`periodsMin-${index}`}
                      type="number"
                      min="1"
                      value={subject.periodsMin}
                      onChange={(e) => handleSubjectChange(index, 'periodsMin', e.target.value)}
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`totalMins-${index}`} className="text-black font-semibold">Total Minutes</Label>
                    <Input
                      id={`totalMins-${index}`}
                      type="number"
                      min="1"
                      value={subject.totalMins}
                      onChange={(e) => handleSubjectChange(index, 'totalMins', e.target.value)}
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`totalHrs-${index}`} className="text-black font-semibold">Total Hours</Label>
                    <Input
                      id={`totalHrs-${index}`}
                      type="number"
                      min="1"
                      value={subject.totalHrs}
                      onChange={(e) => handleSubjectChange(index, 'totalHrs', e.target.value)}
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`credits-${index}`} className="text-black font-semibold">Credits</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`credits-${index}`}
                        type="number"
                        min="0"
                        value={subject.credits}
                        onChange={(e) => handleSubjectChange(index, 'credits', e.target.value)}
                        className="text-black"
                      />
                      {subjects.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeSubject(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Course...
                </>
              ) : (
                'Create Course'
              )}
            </Button>
          </form>

          {/* Debug information */}
          <DebugInfo />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCourseForm;