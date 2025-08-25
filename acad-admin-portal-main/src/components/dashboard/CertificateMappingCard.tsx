import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CertificateMappingCard = () => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/dashboard/certificate-mappings');
  };

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 border border-gray-200 shadow-sm cursor-pointer bg-white"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900">
          Certificate Mapping
        </CardTitle>
        <div className="p-2 rounded-full bg-gray-100">
          <MapPin className="h-5 w-5 text-gray-700" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">
            <FileText className="h-8 w-8 text-gray-700" />
          </div>
          <p className="text-sm text-gray-600">
            View certificate-course mappings and credit usage
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateMappingCard;
