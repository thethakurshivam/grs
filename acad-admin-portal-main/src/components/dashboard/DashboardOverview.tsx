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

const DashboardOverview = () => {
  // Mock data - in real app, this would come from API
  const stats = {
    totalMOU: 45,
    ongoingCourses: 12,
    schoolMOUActivity: 28,
    completedCourses: 156,
    participantsTrained: 2340,
    sectorTraining: 8
  };

  const dashboardCards = [
    {
      title: "Total MOUs",
      value: stats.totalMOU,
      description: "Active memorandums of understanding",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Ongoing Courses",
      value: stats.ongoingCourses,
      description: "Currently active courses",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "MOU School Activity",
      value: stats.schoolMOUActivity,
      description: "Active MOUs under schools",
      icon: School,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Courses Completed",
      value: stats.completedCourses,
      description: "Total courses finished",
      icon: GraduationCap,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Participants Trained",
      value: stats.participantsTrained.toLocaleString(),
      description: "Total students/professionals",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Sector Training",
      value: stats.sectorTraining,
      description: "Specialized training programs",
      icon: Target,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary-hover rounded-lg p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="bg-primary-foreground/10 p-3 rounded-full">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-primary-foreground/80 mt-1">
              Welcome to your university admin panel. Monitor and manage all activities from here.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {card.value}
                </div>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Frequently used administrative functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">New MOU</h3>
              <p className="text-sm text-muted-foreground">Create a new memorandum</p>
            </div>
            <div className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Add Course</h3>
              <p className="text-sm text-muted-foreground">Register new course</p>
            </div>
            <div className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Import Students</h3>
              <p className="text-sm text-muted-foreground">Bulk student registration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;