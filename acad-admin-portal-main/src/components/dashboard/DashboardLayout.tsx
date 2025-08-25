import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";

const DashboardLayout = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-8 shadow-lg">
            <div className="flex items-center gap-6">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">University Admin Portal</h1>
                <p className="text-sm text-gray-600 font-medium">Advanced management & analytics dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;