import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useCompletedCoursesCount } from "@/hooks/useCompletedCoursesCount";
import { useNavigate } from "react-router-dom";

const CompletedCoursesCountCard = () => {
  const { count, loading, error } = useCompletedCoursesCount();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/dashboard/completed-courses');
  };

  if (loading) {
    return (
      <Card 
        className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completed Courses
          </CardTitle>
          <div className="p-2 rounded-full bg-green-50">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              Loading...
            </div>
            <p className="text-sm text-muted-foreground">
              Successfully completed courses
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card 
        className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completed Courses
          </CardTitle>
          <div className="p-2 rounded-full bg-green-50">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              Error
            </div>
            <p className="text-sm text-muted-foreground">
              Failed to load completed courses data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Completed Courses
        </CardTitle>
        <div className="p-2 rounded-full bg-green-50">
          <BookOpen className="h-5 w-5 text-green-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {count}
          </div>
          <p className="text-sm text-muted-foreground">
            Successfully completed courses
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedCoursesCountCard; 