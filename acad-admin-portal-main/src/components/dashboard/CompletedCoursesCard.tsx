import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Calendar, Clock, BookOpen, Building, Target, FileText } from "lucide-react";
import { useCompletedCourses } from "@/hooks/useCompletedCourses";
import { useMOU } from "@/hooks/useMOU";

const CompletedCoursesCard = () => {
  const { courses, count, loading, error } = useCompletedCourses();
  const { fetchMOUById } = useMOU();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mouDetails, setMouDetails] = useState<{[key: string]: any}>({});

  const handleCardClick = () => {
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch MOU details for all courses
  useEffect(() => {
    const fetchMOUDetails = async () => {
      const details: {[key: string]: any} = {};
      
      for (const course of courses) {
        if (course.mou_id && !mouDetails[course.mou_id]) {
          const mou = await fetchMOUById(course.mou_id);
          if (mou) {
            details[course.mou_id] = mou;
          }
        }
      }
      
      setMouDetails(prev => ({ ...prev, ...details }));
    };

    if (courses.length > 0) {
      fetchMOUDetails();
    }
  }, [courses, fetchMOUById]);

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completed Courses
          </CardTitle>
          <div className="p-2 rounded-full bg-orange-50">
            <GraduationCap className="h-5 w-5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              Loading...
            </div>
            <p className="text-sm text-muted-foreground">
              Fetching completed courses
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
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completed Courses
          </CardTitle>
          <div className="p-2 rounded-full bg-orange-50">
            <GraduationCap className="h-5 w-5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              Error
            </div>
            <p className="text-sm text-muted-foreground">
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
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completed Courses
          </CardTitle>
          <div className="p-2 rounded-full bg-orange-50">
            <GraduationCap className="h-5 w-5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {count}
            </div>
            <p className="text-sm text-muted-foreground">
              Total courses finished
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-600" />
              Completed Courses ({count})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {courses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed courses found
              </div>
            ) : (
              courses.map((course) => {
                const mou = mouDetails[course.mou_id];
                return (
                  <Card key={course._id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{course.courseName}</h3>
                            <p className="text-sm text-muted-foreground">ID: {course.ID}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <Target className="h-3 w-3" />
                            Completed
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Organization:</span>
                            <span>{course.organization}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Field:</span>
                            <span>{course.field}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Duration:</span>
                            <span>{course.duration}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Start Date:</span>
                            <span>{formatDate(course.startDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Indoor Credits:</span>
                            <span>{course.indoorCredits}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Outdoor Credits:</span>
                            <span>{course.outdoorCredits}</span>
                          </div>
                          
                          {mou && (
                            <>
                              <div className="flex items-center gap-2 md:col-span-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">MOU:</span>
                                <span>{mou.ID} - {mou.nameOfPartnerInstitution}</span>
                              </div>
                              <div className="flex items-center gap-2 md:col-span-3">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">School:</span>
                                <span>{mou.school}</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {course.subjects && course.subjects.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-medium text-sm mb-2">Subjects ({course.subjects.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {course.subjects.map((subject, index) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                  <div className="font-medium">Subject {index + 1}</div>
                                  <div>Periods: {subject.noOfPeriods} × {subject.periodsMin}min</div>
                                  <div>Total: {subject.totalHrs}hrs ({subject.totalMins}min)</div>
                                  <div>Credits: {subject.credits}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompletedCoursesCard; 