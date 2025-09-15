import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GraduationCap, BookOpen, Activity, Users } from 'lucide-react';

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

  const handleBPRNDClick = () => {
    navigate('/student/bprnd/login');
  };

  const handleBPRNDPOCClick = () => {
    navigate('/poc/bprnd/login');
  };

  return (
    <div className="min-h-screen bg-blue-50 text-black flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[#0b2e63] p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#0b2e63] mb-4">
            University Portal
          </h1>
          <p className="text-black text-lg">Choose your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <Card
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-[#0b2e63]"
            onClick={handleAdminClick}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-[#0b2e63] p-3 rounded-full">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-[#0b2e63]">
                Admin Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6 text-sm">
                Access the administrative dashboard to manage courses, students,
                and university data.
              </p>
              <Button
                className="w-full bg-[#0b2e63] hover:bg-[#09264f] text-white"
                onClick={handleAdminClick}
              >
                Access Admin Portal
              </Button>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-[#0b2e63]"
            onClick={handleStudentClick}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-[#0b2e63] p-3 rounded-full">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-[#0b2e63]">
                Student Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6 text-sm">
                Access your student dashboard to view courses, credits, and
                academic progress.
              </p>
              <Button
                className="w-full bg-[#0b2e63] hover:bg-[#09264f] text-white"
                onClick={handleStudentClick}
              >
                Access Student Portal
              </Button>
            </CardContent>
          </Card>

          {/* POC Card */}
          <Card
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-[#0b2e63]"
            onClick={handlePOCClick}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-[#0b2e63] p-3 rounded-full">
                  <Activity className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-[#0b2e63]">
                POC Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6 text-sm">
                Access the POC management system to handle proof of concept
                activities and partnerships.
              </p>
              <Button
                className="w-full bg-[#0b2e63] hover:bg-[#09264f] text-white"
                onClick={handlePOCClick}
              >
                Access POC Portal
              </Button>
            </CardContent>
          </Card>

          {/* BPR&D Student Card */}
          <Card
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-[#0b2e63]"
            onClick={handleBPRNDClick}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-[#0b2e63] p-3 rounded-full">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-[#0b2e63]">
                BPR&D Trainee Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6 text-sm">
                Access BPR&D candidate dashboard to view courses, projects, and
                research activities.
              </p>
              <Button
                className="w-full bg-[#0b2e63] hover:bg-[#09264f] text-white"
                onClick={handleBPRNDClick}
              >
                Access BPR&D Trainee Portal
              </Button>
            </CardContent>
          </Card>

          {/* BPR&D POC Card */}
          <Card
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-[#0b2e63]"
            onClick={handleBPRNDPOCClick}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-[#0b2e63] p-3 rounded-full">
                  <Activity className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-[#0b2e63]">
                BPR&D POC Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6 text-sm">
                Access the BPR&D Point of Contact portal to manage research
                activities, partnerships, and student progress.
              </p>
              <Button
                className="w-full bg-[#0b2e63] hover:bg-[#09264f] text-white"
                onClick={handleBPRNDPOCClick}
              >
                Access BPR&D POC Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
