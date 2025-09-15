import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useUpcomingCourses } from "@/hooks/useUpcomingCourses";

const UpcomingCoursesCard = () => {
  const navigate = useNavigate();
  const { upcomingCoursesCount, loading, error } = useUpcomingCourses();

  const handleCardClick = () => {
    navigate('/dashboard/upcoming-courses');
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-black">
          Upcoming Courses
        </CardTitle>
        <div className="p-2 rounded-full bg-orange-100">
          <Calendar className="h-5 w-5 text-orange-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-black">
            {loading ? "Loading..." : upcomingCoursesCount}
          </div>
          <p className="text-sm text-black">
            Courses scheduled to start soon
          </p>
          {error && (
            <p className="text-xs text-red-600">
              Unable to fetch latest data
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingCoursesCard; 