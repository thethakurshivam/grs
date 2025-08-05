import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const POCPortalCard = () => {
  const navigate = useNavigate();

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-l-blue-500"
      onClick={() => navigate('/dashboard/poc-portal')}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900">
          POC Portal
        </CardTitle>
        <div className="p-2 rounded-full bg-blue-100">
          <Activity className="h-5 w-5 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">
            Access
          </div>
          <p className="text-sm text-gray-600">
            Manage POC accounts and activities
          </p>
          <div className="flex items-center text-blue-600 text-sm font-medium mt-2">
            <span>Open Portal</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default POCPortalCard; 