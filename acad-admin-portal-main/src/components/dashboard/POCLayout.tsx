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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import usePOCRequestCounts from '@/hooks/usePOCRequestCounts';

interface POCLayoutProps {
  type?: 'standard' | 'bprnd';
}

const POCLayout: React.FC<POCLayoutProps> = ({ type = 'standard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch request counts for badges (only for BPRND POC)
  const { data: requestCounts, isLoading: countsLoading } = usePOCRequestCounts();

  const basePath = type === 'bprnd' ? '/poc-portal/bprnd' : '/poc-portal';

  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: basePath,
      color: 'text-gray-600',
    },
    {
      title: 'Students',
      icon: Users,
      path: `${basePath}/students`,
      color: 'text-blue-600',
    },
    {
      title: 'Bulk Import Students',
      icon: Upload,
      path: `${basePath}/bulk-import-students`,
      color: 'text-indigo-600',
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
    {
      title: 'Requests',
      icon: MessageSquare,
      path: `${basePath}/requests`,
      color: 'text-orange-600',
    },
  ];

  const isActive = (path: string) => {
    if (path === basePath) {
      return location.pathname === basePath;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={
        type === 'bprnd' ? 'min-h-screen bg-blue-50 text-black flex' : 'min-h-screen bg-gray-50 flex'
      }
    >
      {/* Sidebar */}
      <div
        className={
          type === 'bprnd'
            ? 'w-64 bg-[#1e3a8a] shadow-lg border-r border-blue-800'
            : 'w-64 bg-white shadow-lg border-r border-gray-200'
        }
      >
        {/* Sidebar Header */}
        <div
          className={
            type === 'bprnd'
              ? 'p-6 border-b border-blue-800'
              : 'p-6 border-b border-gray-200'
          }
        >
          <div className="flex items-center space-x-3">
            {type === 'bprnd' ? (
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
            ) : (
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <div>
              <h2
                className={
                  type === 'bprnd'
                    ? 'text-lg font-semibold text-white'
                    : 'text-lg font-semibold text-gray-900'
                }
              >
                {type === 'bprnd' ? 'BPR&D POC Portal' : 'POC Portal'}
              </h2>
              <p className={type === 'bprnd' ? 'text-sm text-blue-100' : 'text-sm text-gray-500'}>
                Management Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                isActive(item.path)
                  ? type === 'bprnd'
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                  : type === 'bprnd'
                  ? 'text-blue-100 hover:bg-blue-600 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${
                  isActive(item.path)
                    ? type === 'bprnd'
                      ? 'text-white'
                      : 'text-blue-600'
                    : type === 'bprnd'
                    ? 'text-blue-100'
                    : item.color
                }`}
              />
              <span className="font-medium flex items-center gap-2">
                {item.title}
                {/* Show badge for Requests button when there are pending requests */}
                {type === 'bprnd' && item.title === 'Requests' && !countsLoading && (
                  <>
                    {requestCounts?.pendingCreditsCount > 0 && (
                      <Badge variant="notification" className="ml-auto text-xs">
                        {requestCounts.pendingCreditsCount}
                      </Badge>
                    )}
                    {requestCounts?.pendingCertificationCount > 0 && (
                      <Badge variant="notification" className="ml-auto text-xs">
                        {requestCounts.pendingCertificationCount}
                      </Badge>
                    )}
                  </>
                )}
              </span>
              {/* Show total count badge in top-right corner for collapsed view */}
              {type === 'bprnd' && item.title === 'Requests' && !countsLoading && (
                <>
                  {(requestCounts?.pendingCreditsCount > 0 || requestCounts?.pendingCertificationCount > 0) && (
                    <Badge 
                      variant="notification" 
                      className="absolute -top-1 -right-1 min-w-[20px] h-5 text-xs"
                    >
                      {(requestCounts?.pendingCreditsCount || 0) + (requestCounts?.pendingCertificationCount || 0)}
                    </Badge>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          className={
            type === 'bprnd'
              ? 'absolute bottom-0 w-64 p-4 border-t border-blue-800'
              : 'absolute bottom-0 w-64 p-4 border-t border-gray-200'
          }
        >
          <div className="space-y-2">
            <button
              onClick={() => navigate('/')}
              className={
                type === 'bprnd'
                  ? 'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-blue-100 hover:bg-blue-600 hover:text-white transition-colors'
                  : 'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors'
              }
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Portal Selection</span>
            </button>
            <button
              onClick={() => {
                // Clear POC authentication data
                localStorage.removeItem('pocToken');
                localStorage.removeItem('pocUser');
                localStorage.removeItem('pocUserId');
                localStorage.removeItem('isPOCAuthenticated');
                navigate('/');
              }}
              className={
                type === 'bprnd'
                  ? 'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-blue-100 hover:bg-blue-600 hover:text-white transition-colors'
                  : 'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors'
              }
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header
          className={
            type === 'bprnd'
              ? 'bg-white shadow-sm border-b border-blue-200 px-6 py-4'
              : 'bg-white shadow-sm border-b border-gray-200 px-6 py-4'
          }
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={
                  type === 'bprnd'
                    ? 'text-2xl font-bold text-[#1e3a8a]'
                    : 'text-2xl font-bold text-gray-900'
                }
              >
                {sidebarItems.find((item) => isActive(item.path))?.title ||
                  'POC Portal'}
              </h1>
              <p className={type === 'bprnd' ? 'text-gray-700' : 'text-gray-600'}>
                {isActive(basePath) &&
                  `Welcome to the ${
                    type === 'bprnd' ? 'BPR&D POC' : 'POC'
                  } portal. Manage and monitor all activities from here.`}
                {isActive('/poc-portal/students') &&
                  'Manage and view all students associated with your POC account.'}
                {isActive('/poc-portal/bulk-import-students') &&
                  'Import multiple students from CSV or Excel files.'}
                {isActive('/poc-portal/courses') &&
                  'View and manage all courses associated with your POC account.'}
                {isActive('/poc-portal/mous') &&
                  'View and manage all Memorandum of Understanding agreements.'}
                {isActive('/poc-portal/requests') &&
                  'Manage pending approval requests.'}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default POCLayout;
