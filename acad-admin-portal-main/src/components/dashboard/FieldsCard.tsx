import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Target, BookOpen, Hash, ArrowRight } from "lucide-react";
import { useFields } from "@/hooks/useFields";
import { useFieldCourses } from "@/hooks/useFieldCourses";

const FieldsCard = () => {
  const { fields, count, loading, error } = useFields();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isCoursesDialogOpen, setIsCoursesDialogOpen] = useState(false);
  
  const { courses, field, coursesCount, loading: coursesLoading, error: coursesError } = useFieldCourses(selectedFieldId);

  const handleCardClick = () => {
    setIsDialogOpen(true);
  };

  const handleFieldClick = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    setIsCoursesDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">
            Sector Training
          </CardTitle>
          <div className="p-2 rounded-full bg-red-50">
            <Target className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              Loading...
            </div>
            <p className="text-sm text-black">
              Fetching fields data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">
            Sector Training
          </CardTitle>
          <div className="p-2 rounded-full bg-red-50">
            <Target className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              Error
            </div>
            <p className="text-sm text-black">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">
            Sector Training
          </CardTitle>
          <div className="p-2 rounded-full bg-red-50">
            <Target className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              {count}
            </div>
            <p className="text-sm text-black">
              Specialized training programs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fields List Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <Target className="h-5 w-5 text-red-600" />
              Sector Training Fields ({count})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-black">
                No fields found
              </div>
            ) : (
              fields.map((field) => (
                <Card key={field.id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg text-black">{field.nameOfTheField}</h3>
                        <p className="text-sm text-black">Field ID: {field.id}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-black">Courses</div>
                          <div className="text-lg font-bold text-black">{field.count}</div>
                        </div>
                        <button
                          onClick={() => handleFieldClick(field.id)}
                          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                        >
                          <BookOpen className="h-4 w-4" />
                          View Courses
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Courses List Dialog */}
      <Dialog open={isCoursesDialogOpen} onOpenChange={setIsCoursesDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black">
              <BookOpen className="h-5 w-5 text-red-600" />
              {field ? `${field.nameOfTheField} Courses` : 'Loading...'} ({coursesCount})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {coursesLoading ? (
              <div className="text-center py-8 text-black">
                Loading courses...
              </div>
            ) : coursesError ? (
              <div className="text-center py-8 text-red-600">
                Error: {coursesError}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8 text-black">
                No courses found for this field
              </div>
            ) : (
              courses.map((course) => (
                <Card key={course._id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg text-black">{course.courseName}</h3>
                          <p className="text-sm text-black">ID: {course.ID}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <Target className="h-3 w-3" />
                          {course.completionStatus}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">Organization:</span>
                          <span className="text-black">{course.organization}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">Duration:</span>
                          <span className="text-black">{course.duration}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">Start Date:</span>
                          <span className="text-black">{formatDate(course.startDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">Indoor Credits:</span>
                          <span className="text-black">{course.indoorCredits}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">Outdoor Credits:</span>
                          <span className="text-black">{course.outdoorCredits}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">Field:</span>
                          <span className="text-black">{course.field}</span>
                        </div>
                      </div>
                      
                      {course.subjects && course.subjects.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-2 text-black">Subjects ({course.subjects.length})</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {course.subjects.map((subject, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                <div className="font-medium text-black">Subject {index + 1}</div>
                                <div className="text-black">Periods: {subject.noOfPeriods} × {subject.periodsMin}min</div>
                                <div className="text-black">Total: {subject.totalHrs}hrs ({subject.totalMins}min)</div>
                                <div className="text-black">Credits: {subject.credits}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FieldsCard; 