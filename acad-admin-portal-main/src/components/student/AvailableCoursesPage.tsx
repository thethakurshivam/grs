import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { BookOpen, Clock, Award, Building, Calendar, UserPlus, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { useStudentCourses } from '../../hooks/useStudentCourses';
import { useToast } from '../../hooks/use-toast';

export const AvailableCoursesPage: React.FC = () => {
  const [studentId, setStudentId] = useState<string>('');
  const { courses, loading, error, fetchCourses } = useStudentCourses();
  const { toast } = useToast();
  
  // Payment flow state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedStudentId = localStorage.getItem('studentId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchCourses(studentId);
    }
  }, [studentId, fetchCourses]);

  const handleEnroll = (courseId: string) => {
    // Dummy enrollment - just show a message
    alert(`You clicked to enroll in course: ${courseId}\n\nThis is a dummy enrollment button for demonstration purposes.`);
    
    // Comment out the original payment dialog logic
    // setSelectedCourseId(courseId);
    // setPaymentDialogOpen(true);
  };

  const handlePaymentAccept = () => {
    setPaymentDialogOpen(false);
    setSuccessDialogOpen(true);
    setEnrolledCourses(prev => new Set([...prev, selectedCourseId]));
  };

  const handlePaymentDecline = () => {
    setPaymentDialogOpen(false);
    setDeclineDialogOpen(true);
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    setSelectedCourseId('');
  };

  const handleDeclineDialogClose = () => {
    setDeclineDialogOpen(false);
    setSelectedCourseId('');
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.has(courseId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-gray-700 mt-2">Browse and enroll in available courses.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading courses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-gray-700 mt-2">Browse and enroll in available courses.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-900 font-semibold mb-2">Error loading courses:</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
        <p className="text-gray-700 mt-2">Browse and enroll in available courses.</p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Available Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available</h3>
              <p className="text-gray-600">
                No courses are currently available for enrollment.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  {course.courseName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-700 mb-1 font-semibold">
                      Organization:
                    </p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      {course.organization}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-1 font-semibold">
                      Field:
                    </p>
                    <p className="text-gray-900">{course.field}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-1 font-semibold">
                      Duration:
                    </p>
                    <p className="text-gray-900 flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {course.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 mb-1 font-semibold">
                      Start Date:
                    </p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(course.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200">
                    <Award className="h-3 w-3" />
                    <span className="font-semibold">{course.indoorCredits + course.outdoorCredits} Credits</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 border-gray-300 text-gray-800 bg-gray-50">
                    <Clock className="h-3 w-3" />
                    <span className="font-semibold">{course.duration}</span>
                  </Badge>
                </div>
                
                {/* Enrollment Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => handleEnroll(course._id)}
                    disabled={isEnrolled(course._id)}
                    className={`font-semibold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      isEnrolled(course._id)
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isEnrolled(course._id) ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Enrolled
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Enroll
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CreditCard className="h-5 w-5" />
              Proceed with Payment
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              You are about to enroll in a course. Please confirm your payment to proceed with the enrollment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={handlePaymentDecline}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={handlePaymentAccept}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Payment Successful
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Your payment has been processed successfully. You are now enrolled in the course!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleSuccessDialogClose}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Declined Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Payment Declined
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Your payment has been declined. You can try again later or contact support for assistance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleDeclineDialogClose}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 