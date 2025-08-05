import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GraduationCap, BookOpen, Activity } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin/login');
  };

  const handleStudentClick = () => {
    navigate('/student/login');
  };

  const handlePOCClick = () => {
    navigate('/poc/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-university-blue-light to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">University Portal</h1>
          <p className="text-black text-lg">Choose your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Admin Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleAdminClick}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary p-3 rounded-full">
                  <GraduationCap className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-primary">Admin Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6 text-sm">
                Access the administrative dashboard to manage courses, students, and university data.
              </p>
              <Button className="w-full" onClick={handleAdminClick}>
                Access Admin Portal
              </Button>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleStudentClick}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary p-3 rounded-full">
                  <BookOpen className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-primary">Student Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6 text-sm">
                Access your student dashboard to view courses, credits, and academic progress.
              </p>
              <Button className="w-full" onClick={handleStudentClick}>
                Access Student Portal
              </Button>
            </CardContent>
          </Card>

          {/* POC Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handlePOCClick}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Activity className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-blue-600">POC Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6 text-sm">
                Access the POC management system to handle proof of concept activities and partnerships.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handlePOCClick}>
                Access POC Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 