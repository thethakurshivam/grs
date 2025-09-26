import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  BookOpen, 
  School, 
  GraduationCap, 
  Users, 
  Target,
  TrendingUp,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSchools } from "@/hooks/useSchools";
import ParticipantsCard from "./ParticipantsCard";
import FieldsCard from "./FieldsCard";
import MOUCard from "./MOUCard";
import CompletedCoursesCountCard from "./CompletedCoursesCountCard";
import OngoingCoursesCountCard from "./OngoingCoursesCountCard";
import UpcomingCoursesCard from "./UpcomingCoursesCard";
import CertificateMappingCard from "./CertificateMappingCard";

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { schools, count, loading, error, fetchSchools } = useSchools();
  
  // Fetch schools on component mount
  React.useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);
  
  const dashboardCards = [
    {
      title: "MOU School Activity",
      value: loading ? "Loading..." : error ? "Error" : count,
      description: "Active MOUs under schools",
      icon: School,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => navigate('/dashboard/schools')
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl shadow-md">
            <Activity className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard Overview</h1>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-6">
        {/* MOU Card - Dynamic from API */}
        <MOUCard />
        
        {/* Completed Courses Count Card - Dynamic from API */}
        <CompletedCoursesCountCard />
        
        {/* Ongoing Courses Count Card - Dynamic from API */}
        <OngoingCoursesCountCard />
        
        {/* Upcoming Courses Count Card - Dynamic from API */}
        <UpcomingCoursesCard />
        
        {/* Certificate Mapping Card */}
        <CertificateMappingCard />
        
        {dashboardCards.map((card, index) => (
          <Card 
            key={index} 
            className="hover:shadow-md transition-all duration-200 border border-gray-200 shadow-sm cursor-pointer bg-white"
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">
                {card.title}
              </CardTitle>
              <div className="p-2 rounded-full bg-gray-100">
                <card.icon className="h-5 w-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">
                  {card.value}
                </div>
                <p className="text-sm text-gray-600">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Participants Card - Dynamic from API */}
        <ParticipantsCard />
        
        {/* Fields Card - Dynamic from API */}
        <FieldsCard />
      </div>

      {/* Quick Actions */}
      <Card className="border border-gray-200 shadow-xl rounded-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-2 rounded-xl">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            Quick Actions
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Frequently used administrative functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              className="p-6 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-blue-50"
              onClick={() => navigate('/dashboard/add-mou')}
            >
              <div className="bg-blue-100 p-3 rounded-xl w-fit mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Add MOU</h3>
              <p className="text-sm text-gray-600">Create new partnership agreements</p>
            </div>
            <div 
              className="p-6 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-emerald-50"
              onClick={() => navigate('/dashboard/add-course')}
            >
              <div className="bg-emerald-100 p-3 rounded-xl w-fit mb-4">
                <BookOpen className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Add Course</h3>
              <p className="text-sm text-gray-600">Create new academic courses</p>
            </div>
            <div 
              className="p-6 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-purple-50"
              onClick={() => navigate('/dashboard/bulk-import-students')}
            >
              <div className="bg-purple-100 p-3 rounded-xl w-fit mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Import Students</h3>
              <p className="text-sm text-gray-600">Bulk import student data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;