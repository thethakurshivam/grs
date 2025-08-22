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
      className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-black">
          Certificate Mapping
        </CardTitle>
        <div className="p-2 rounded-full bg-blue-50">
          <MapPin className="h-5 w-5 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-black">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-black">
            View certificate-course mappings and credit usage
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateMappingCard;
