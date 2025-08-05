import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import usePOCStudents from '@/hooks/usePOCStudents';
import { usePOCCourses } from '@/hooks/usePOCCourses';
import { usePOCMOUs } from '@/hooks/usePOCMOUs';

const POCPortalPage = () => {
  const navigate = useNavigate();
  
  // Get POC ID from localStorage or use a demo ID
  const pocId = localStorage.getItem('pocUserId') || 'demo-poc-user-id-123';
  const { students, loading: studentsLoading } = usePOCStudents(pocId);
  const { courses, loading: coursesLoading } = usePOCCourses();
  const { mous, loading: mousLoading } = usePOCMOUs();
  
  const [stats] = useState({
    requests: 8
  });

  const dashboardCards = [
    {
      title: "Students",
      value: studentsLoading ? "Loading..." : students.length.toLocaleString(),
      description: "Total registered students",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/poc-portal/students"
    },
    {
      title: "Courses",
      value: coursesLoading ? "Loading..." : courses.length.toLocaleString(),
      description: "Active courses available",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
      path: "/poc-portal/courses"
    },
    {
      title: "MOUs",
      value: mousLoading ? "Loading..." : mous.length.toLocaleString(),
      description: "Memorandum of Understanding",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      path: "/poc-portal/mous"
    },
    {
      title: "Requests",
      value: stats.requests,
      description: "Pending approval requests",
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      path: "/poc-portal/requests"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          POC Portal Dashboard 👋
        </h2>
        <p className="text-gray-600">
          Welcome to the POC (Proof of Concept) portal. Manage and monitor all POC activities from here.
        </p>
      </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md"
              onClick={() => navigate(card.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
    </div>
  );
};

export default POCPortalPage; 