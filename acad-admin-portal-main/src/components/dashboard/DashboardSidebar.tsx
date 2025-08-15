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
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-3 p-4">
          <div className="bg-primary-foreground/10 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold">University Admin</h2>
              <p className="text-sm opacity-80">Management Panel</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-card">
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
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
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
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
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
                    className="w-full justify-start hover:bg-accent"
                    onClick={() =>
                      navigate('/dashboard/bprnd-certification-request')
                    }
                  >
                    <Send className="h-4 w-4" />
                    {!collapsed && <span className="ml-2">BPR&D Certification Request</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-card">
        <div className="p-4">
          {!collapsed && (
            <div className="mb-3">
              <p className="text-sm font-medium">Welcome back,</p>
              <p className="text-sm text-muted-foreground">{userName}</p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full"
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