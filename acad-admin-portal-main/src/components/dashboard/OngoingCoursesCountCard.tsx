import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useOngoingCoursesCount } from "@/hooks/useOngoingCoursesCount";
import { useNavigate } from "react-router-dom";

const OngoingCoursesCountCard = () => {
  const { count, loading, error } = useOngoingCoursesCount();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/dashboard/ongoing-courses');
  };

  if (loading) {
    return (
      <Card 
        className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">
            Ongoing Courses
          </CardTitle>
          <div className="p-2 rounded-full bg-green-50">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              Loading...
            </div>
            <p className="text-sm text-black">
              Currently active courses
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
          <CardTitle className="text-sm font-medium text-black">
            Ongoing Courses
          </CardTitle>
          <div className="p-2 rounded-full bg-green-50">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              Error
            </div>
            <p className="text-sm text-black">
              Failed to load ongoing courses data
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
        <CardTitle className="text-sm font-medium text-black">
          Ongoing Courses
        </CardTitle>
        <div className="p-2 rounded-full bg-green-50">
          <BookOpen className="h-5 w-5 text-green-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-black">
            {count}
          </div>
          <p className="text-sm text-black">
            Currently active courses
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OngoingCoursesCountCard; 