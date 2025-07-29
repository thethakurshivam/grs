import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useMOU } from "@/hooks/useMOU";
import { useNavigate } from "react-router-dom";

const MOUCard = () => {
  const { count, loading, error } = useMOU();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/dashboard/mous');
  };

  if (loading) {
    return (
      <Card 
        className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total MOUs
          </CardTitle>
          <div className="p-2 rounded-full bg-blue-50">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              Loading...
            </div>
            <p className="text-sm text-muted-foreground">
              Active memorandums of understanding
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
            Total MOUs
          </CardTitle>
          <div className="p-2 rounded-full bg-blue-50">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              Error
            </div>
            <p className="text-sm text-muted-foreground">
              Failed to load MOU data
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
          Total MOUs
        </CardTitle>
        <div className="p-2 rounded-full bg-blue-50">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {count}
          </div>
          <p className="text-sm text-muted-foreground">
            Active memorandums of understanding
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MOUCard; 