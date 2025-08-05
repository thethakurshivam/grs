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

const POCPortalPage = () => {
  const navigate = useNavigate();
  
  // Get POC ID from localStorage or use a demo ID
  const pocId = localStorage.getItem('pocUserId') || 'demo-poc-user-id-123';
  const { students, loading: studentsLoading } = usePOCStudents(pocId);
  
  const [stats] = useState({
    courses: 45,
    mous: 23,
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
      value: stats.courses,
      description: "Active courses available",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
      path: "/poc-portal/courses"
    },
    {
      title: "MOUs",
      value: stats.mous,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Portal Selection</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">POC Admin</span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Exit POC Portal</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  );
};

export default POCPortalPage; 