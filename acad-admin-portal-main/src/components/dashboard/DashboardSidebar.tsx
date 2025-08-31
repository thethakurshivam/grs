import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  BookOpen, 
  Database, 
  Users, 
  GraduationCap,
  LogOut,
  Menu,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useAdminPendingCredits from "@/hooks/useAdminPendingCredits";
import useAdminBPRNDClaims from "@/hooks/useAdminBPRNDClaims";

const sidebarItems = [
  {
    title: "Add MOU",
    url: "/dashboard/add-mou",
    icon: FileText,
  },
  {
    title: "Bulk Import MOU",
    url: "/dashboard/bulk-import-mou",
    icon: Upload,
  },
  {
    title: "Add Course",
    url: "/dashboard/add-course",
    icon: BookOpen,
  },
  {
    title: "Bulk Import Courses",
    url: "/dashboard/bulk-import-courses",
    icon: Database,
  },
  {
    title: "Bulk Import Students",
    url: "/dashboard/bulk-import-students",
    icon: Users,
  },
];

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { toast } = useToast();
  const userName = localStorage.getItem("userName") || "Admin";
  const collapsed = state === "collapsed";
  
  // Fetch data for badges using new efficient hooks
  const { count: pendingCreditsCount, isLoading: pendingCreditsLoading } = useAdminPendingCredits();
  const { count: pendingCertificationCount, isLoading: pendingCertificationLoading } = useAdminBPRNDClaims();
  

  


  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? "w-16" : "w-72"} collapsible="icon">
      <SidebarHeader className="border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-4 p-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-gray-900 text-lg">University Admin</h2>
              <p className="text-sm text-gray-600 font-medium">Management Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white/95 backdrop-blur-sm">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard Overview */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/dashboard"}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location.pathname === "/dashboard"
                        ? "bg-blue-50 text-blue-900 border-r-4 border-blue-500"
                        : "hover:bg-blue-50 text-gray-700 hover:text-blue-900"
                    }`}
                    onClick={() => navigate("/dashboard")}
                  >
                    <Menu className="h-4 w-4" />
                    {!collapsed && <span className="ml-2">Dashboard</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Main Menu Items */}
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        isActive(item.url)
                          ? "bg-blue-50 text-blue-900 border-r-4 border-blue-500"
                          : "hover:bg-blue-50 text-gray-700 hover:text-blue-900"
                      }`}
                      onClick={() => navigate(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* BPR&D Certification Request */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-blue-50 text-gray-700 hover:text-blue-900 relative"
                    onClick={() =>
                      navigate('/dashboard/bprnd-certification-request')
                    }
                  >
                    <Send className="h-4 w-4" />
                    {!collapsed && (
                      <span className="ml-2 flex items-center gap-2 min-w-0">
                        <span className="truncate">BPR&D Certification Request</span>
                        {!pendingCertificationLoading && pendingCertificationCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full min-w-[20px]">
                            {pendingCertificationCount}
                          </span>
                        )}
                      </span>
                    )}
                    {/* Show badge only when there are pending requests */}
                    {!pendingCertificationLoading && pendingCertificationCount > 0 && (
                      <span 
                        className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full min-w-[20px] h-5 ${collapsed ? 'block' : 'hidden'}`}
                      >
                        {pendingCertificationCount}
                      </span>
                    )}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* BPR&D Pending Credits */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-blue-50 text-gray-700 hover:text-blue-900 relative"
                    onClick={() =>
                      navigate('/dashboard/bprnd-pending-credits')
                    }
                  >
                    <FileText className="h-4 w-4" />
                    {!collapsed && (
                      <span className="ml-2 flex items-center gap-2 min-w-0">
                        <span className="truncate">BPR&D Pending Credits</span>
                        {!pendingCreditsLoading && pendingCreditsCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full min-w-[20px]">
                            {pendingCreditsCount}
                          </span>
                        )}
                      </span>
                    )}
                    {/* Show badge even when collapsed */}
                    {!pendingCreditsLoading && pendingCreditsCount > 0 && (
                      <span 
                        className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full min-w-[20px] h-5 ${collapsed ? 'block' : 'hidden'}`}
                      >
                        {pendingCreditsCount}
                      </span>
                    )}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="p-6">
          {!collapsed && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p className="text-sm font-semibold text-gray-800">Welcome back,</p>
              <p className="text-sm text-blue-700 font-medium">{userName}</p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-colors rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}