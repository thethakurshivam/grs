import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  MapPin,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BPRNDDashboard = () => {
  const navigate = useNavigate();

  const bprndCards = [
    {
      title: "Certificate Mapping",
      description: "View certificate-course mappings and credit usage",
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => navigate('/dashboard/certificate-mappings')
    },
    {
      title: "Analytics",
      description: "View BPR&D program analytics and reports",
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      onClick: () => navigate('/dashboard/bprnd-analytics')
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* BPR&D Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl shadow-md">
            <Activity className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">BPR&D Management</h1>
            <p className="text-gray-600 mt-2 text-lg">
              Comprehensive management portal for BPR&D programs, certifications, and student data
            </p>
          </div>
        </div>
      </div>

      {/* BPR&D Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-6">
        {bprndCards.map((card, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-all duration-300 border border-gray-200 shadow-sm cursor-pointer bg-white hover:scale-105"
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {card.title}
              </CardTitle>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-600">
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BPRNDDashboard;
