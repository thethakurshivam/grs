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
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const POCLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/poc-portal",
      color: "text-gray-600"
    },
    {
      title: "Students",
      icon: Users,
      path: "/poc-portal/students",
      color: "text-blue-600"
    },
    {
      title: "Bulk Import Students",
      icon: Upload,
      path: "/poc-portal/bulk-import-students",
      color: "text-indigo-600"
    },
    {
      title: "Courses",
      icon: BookOpen,
      path: "/poc-portal/courses",
      color: "text-green-600"
    },
    {
      title: "MOUs",
      icon: FileText,
      path: "/poc-portal/mous",
      color: "text-purple-600"
    },
    {
      title: "Requests",
      icon: MessageSquare,
      path: "/poc-portal/requests",
      color: "text-orange-600"
    }
  ];

  const isActive = (path: string) => {
    if (path === "/poc-portal") {
      return location.pathname === "/poc-portal";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">POC Portal</h2>
              <p className="text-sm text-gray-500">Management Dashboard</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-blue-600' : item.color}`} />
              <span className="font-medium">{item.title}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
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
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
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
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sidebarItems.find(item => isActive(item.path))?.title || 'POC Portal'}
              </h1>
              <p className="text-gray-600">
                {isActive('/poc-portal') && 'Welcome to the POC (Proof of Concept) portal. Manage and monitor all POC activities from here.'}
                {isActive('/poc-portal/students') && 'Manage and view all students associated with your POC account.'}
                {isActive('/poc-portal/bulk-import-students') && 'Import multiple students from CSV or Excel files.'}
                {isActive('/poc-portal/courses') && 'View and manage all courses associated with your POC account.'}
                {isActive('/poc-portal/mous') && 'View and manage all Memorandum of Understanding agreements.'}
                {isActive('/poc-portal/requests') && 'Manage pending approval requests.'}
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