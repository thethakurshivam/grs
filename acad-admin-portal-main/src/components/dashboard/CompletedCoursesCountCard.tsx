import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useCompletedCourses } from "@/hooks/useCompletedCourses";
import { useNavigate } from "react-router-dom";

const CompletedCoursesCountCard = () => {
  const { count, loading, error } = useCompletedCourses();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/dashboard/completed-courses');
  };

  if (loading) {
    return (
      <Card 
        className="hover:shadow-md transition-all duration-200 border border-gray-200 shadow-sm cursor-pointer bg-white"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900">
            Completed Courses
          </CardTitle>
          <div className="p-2 rounded-full bg-gray-100">
            <BookOpen className="h-5 w-5 text-gray-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              Loading...
            </div>
            <p className="text-sm text-gray-600">
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
        className="hover:shadow-md transition-all duration-200 border border-gray-200 shadow-sm cursor-pointer bg-white"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900">
            Completed Courses
          </CardTitle>
          <div className="p-2 rounded-full bg-gray-100">
            <BookOpen className="h-5 w-5 text-gray-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              Error
            </div>
            <p className="text-sm text-gray-600">
              Failed to load completed courses data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 border border-gray-200 shadow-sm cursor-pointer bg-white"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900">
          Completed Courses
        </CardTitle>
        <div className="p-2 rounded-full bg-gray-100">
          <BookOpen className="h-5 w-5 text-gray-700" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">
            {count}
          </div>
          <p className="text-sm text-gray-600">
            Successfully completed courses
        </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedCoursesCountCard; 