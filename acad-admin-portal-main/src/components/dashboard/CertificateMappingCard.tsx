import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CertificateMappingCard = () => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/dashboard/bprnd');
  };

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 border border-gray-200 shadow-sm cursor-pointer bg-white"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold text-gray-900">
          BPR&D
        </CardTitle>
        <div className="p-2 rounded-full bg-blue-100">
          <MapPin className="h-5 w-5 text-blue-700" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">
            <FileText className="h-8 w-8 text-blue-700" />
          </div>
          <p className="text-sm text-gray-600">
            Manage BPR&D programs and certificate mappings
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateMappingCard;
