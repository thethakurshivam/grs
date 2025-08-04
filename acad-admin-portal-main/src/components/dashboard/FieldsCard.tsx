import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useSectorTraining } from "@/hooks/useSectorTraining";

const FieldsCard = () => {
  console.log('FieldsCard: Component rendered');
  const navigate = useNavigate();
  const { fields, loading, error } = useSectorTraining();

  const handleCardClick = () => {
    console.log('FieldsCard: Card clicked, navigating to /dashboard/sector-training');
    navigate('/dashboard/sector-training');
  };



  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">
            Sector Training
          </CardTitle>
          <div className="p-2 rounded-full bg-red-50">
            <Target className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              Loading...
            </div>
            <p className="text-sm text-black">
              Fetching fields data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">
            Sector Training
          </CardTitle>
          <div className="p-2 rounded-full bg-red-50">
            <Target className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              Error
            </div>
            <p className="text-sm text-black">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">
            Sector Training
          </CardTitle>
          <div className="p-2 rounded-full bg-red-50">
            <Target className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-black">
              {fields.length}
            </div>
            <p className="text-sm text-black">
              Specialized training programs
            </p>
          </div>
        </CardContent>
      </Card>


    </>
  );
};

export default FieldsCard; 