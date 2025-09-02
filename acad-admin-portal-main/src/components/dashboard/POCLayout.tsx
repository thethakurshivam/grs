import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  ArrowLeft,
  LogOut,
  Upload,
  Home,
  Award,
  Shield,
  ShieldAlert,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBPRNDPendingCredits } from '@/hooks/useBPRNDPendingCredits';
import { useBPRNDPOCClaims } from '@/hooks/useBPRNDPOCClaims';
import { useBPRNDDeclinedRequestsCount } from '@/hooks/useBPRNDDeclinedRequestsCount';
import { Link } from 'react-router-dom';

interface POCLayoutProps {
  type?: 'standard' | 'bprnd';
}

const POCLayout: React.FC<POCLayoutProps> = ({ type = 'standard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch data for badges using new efficient hooks (only for BPRND POC)
  const { count: pendingCreditsCount, isLoading: pendingCreditsLoading } = useBPRNDPendingCredits();
  const { count: pendingCertificationCount, loading: pendingCertificationLoading } = useBPRNDPOCClaims();
  const { count: declinedRequestsCount, loading: declinedRequestsLoading } = useBPRNDDeclinedRequestsCount();

  const basePath = type === 'bprnd' ? '/poc-portal/bprnd' : '/poc-portal';

  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: basePath,
      color: 'text-gray-600',
    },
    // Only show these items for standard POC, not for BPRND POC
    ...(type !== 'bprnd' ? [
      {
        title: 'Students',
        icon: Users,
        path: `${basePath}/students`,
        color: 'text-blue-600',
      },
      {
        title: 'Courses',
        icon: BookOpen,
        path: `${basePath}/courses`,
        color: 'text-green-600',
      },
      {
        title: 'MOUs',
        icon: FileText,
        path: `${basePath}/mous`,
        color: 'text-purple-600',
      },
    ] : []),
    // Bulk Import Students - different paths for different POC types
    {
      title: 'Bulk Import Students',
      icon: Upload,
      path: type === 'bprnd' ? '/poc-portal/bprnd/bulk-import-students' : `${basePath}/bulk-import-students`,
      color: 'text-indigo-600',
    },
    // Add Certifications button only for BPRND POC
    ...(type === 'bprnd' ? [{
      title: 'Certifications',
      icon: Award,
      path: `${basePath}/claims`,
      color: 'text-amber-600',
    }] : []),
    // Add Pending Credits button only for BPRND POC
    ...(type === 'bprnd' ? [{
      title: 'Pending Credits',
      icon: Shield,
      path: `${basePath}/pending-credits`,
      color: 'text-red-600',
    }] : []),
    // Add Declined Requests button only for BPRND POC
    ...(type === 'bprnd' ? [{
      title: 'Declined Requests',
      icon: ShieldAlert,
      path: `${basePath}/declined-requests`,
      color: 'text-orange-600',
    }] : []),
  ];

  const isActive = (path: string) => {
    if (path === basePath) {
      return location.pathname === basePath;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Clear POC authentication data
    localStorage.removeItem('pocToken');
    localStorage.removeItem('pocUser');
    localStorage.removeItem('pocUserId');
    localStorage.removeItem('isPOCAuthenticated');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo/Brand Section */}
          <div className="p-7 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {type === 'bprnd' ? 'BPR&D POC Portal' : 'POC Portal'}
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  {type === 'bprnd' ? 'Point of Contact Dashboard' : 'Point of Contact Dashboard'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => (
              <div key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${
                    location.pathname === item.path ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  <span className="flex-1">{item.title}</span>
                  
                  {/* Badge for Pending Credits and Certifications */}
                  {item.title === 'Pending Credits' && !pendingCreditsLoading && pendingCreditsCount > 0 && (
                    <div className="ml-auto">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full min-w-[20px]">
                        {pendingCreditsCount}
                      </span>
                    </div>
                  )}
                  
                  {item.title === 'Certifications' && !pendingCertificationLoading && pendingCertificationCount > 0 && (
                    <div className="ml-auto">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full min-w-[20px]">
                        {pendingCertificationCount}
                      </span>
                    </div>
                  )}
                  
                  {item.title === 'Declined Requests' && !declinedRequestsLoading && declinedRequestsCount > 0 && (
                    <div className="ml-auto">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full min-w-[20px]">
                        {declinedRequestsCount}
                      </span>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {type === 'bprnd' ? 'BPR&D Point of Contact' : 'Point of Contact'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {type === 'bprnd' ? 'BPR&D Portal' : 'POC Portal'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-72">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default POCLayout;
