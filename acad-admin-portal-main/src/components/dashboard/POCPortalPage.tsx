import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { POCComponentProps } from '@/types/poc';
import useBPRNDStudentsCount from '@/hooks/useBPRNDStudentsCount';
import usePOCStudents from '@/hooks/usePOCStudents';
import { usePOCCourses } from '@/hooks/usePOCCourses';
import { usePOCMOUs } from '@/hooks/usePOCMOUs';

const POCPortalPage: React.FC<POCComponentProps> = ({ type = 'standard' }) => {
  const navigate = useNavigate();

  // Get POC ID from localStorage or use a demo ID
  const pocId = localStorage.getItem('pocUserId') || 'demo-poc-user-id-123';

  // Hook for BPRND students count
  const { count: bprndStudentsCount, isLoading: bprndStudentsLoading, error: bprndStudentsError } = useBPRNDStudentsCount();

  // Hooks for normal POC data
  const { students, loading: studentsLoading, error: studentsError } = usePOCStudents(pocId);
  const { courses, loading: coursesLoading, error: coursesError } = usePOCCourses(pocId);
  const { mous, loading: mousLoading, error: mousError } = usePOCMOUs(pocId);

  const [stats] = useState({
    requests: 8, // This is for standard POC requests
  });

  const dashboardCards = [
    // Only show these cards for standard POC, not for BPRND POC
    ...(type !== 'bprnd' ? [
      {
        title: 'Students',
        value: studentsLoading ? 'Loading...' : studentsError ? 'Error' : `${students.length} students`,
        description: 'Total registered students',
        icon: Users,
        color: studentsError ? 'text-red-600' : 'text-gray-800',
        bgColor: studentsError ? 'bg-red-100' : 'bg-gray-100',
        path: '/poc-portal/students',
      },
      {
        title: 'Courses',
        value: coursesLoading ? 'Loading...' : coursesError ? 'Error' : `${courses.length} courses`,
        description: 'Active courses available',
        icon: BookOpen,
        color: coursesError ? 'text-red-600' : 'text-gray-800',
        bgColor: coursesError ? 'bg-red-100' : 'bg-gray-100',
        path: '/poc-portal/courses',
      },
      {
        title: 'MOUs',
        value: mousLoading ? 'Loading...' : mousError ? 'Error' : `${mous.length} MOUs`,
        description: 'Memorandum of Understanding',
        icon: FileText,
        color: mousError ? 'text-red-600' : 'text-gray-800',
        bgColor: mousError ? 'bg-red-100' : 'bg-gray-100',
        path: '/poc-portal/mous',
      },
    ] : []),
    // BPRND POC specific cards
    ...(type === 'bprnd' ? [
      {
        title: 'Total Students',
        value: bprndStudentsLoading ? 'Loading...' : bprndStudentsError ? 'Error' : bprndStudentsCount.toString(),
        description: 'Registered BPR&D candidates',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        path: '/poc-portal/bprnd/students',
      },
      {
        title: 'Analytics Dashboard',
        value: 'View Insights',
        description: 'Performance analytics & reports',
        icon: BarChart3,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        path: '/poc-portal/bprnd/analytics',
      },
    ] : []),
    // Certification Requests card removed for BPRND POC portal
    ...(type !== 'bprnd' ? [{
      title: 'Requests',
      value: stats.requests,
      description: 'Pending approval requests',
      icon: MessageSquare,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      path: '/poc-portal/requests',
    }] : []),
  ];

  return (
    <div className={`min-h-screen ${type === 'bprnd' ? 'bg-gradient-to-br from-slate-50 to-blue-50' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Welcome Section */}
        <div className={`mb-8 ${
          type === 'bprnd' ? 'bg-white p-8 rounded-2xl border border-gray-200 shadow-lg' : ''
        }`}>
        <h1 className={`font-bold text-gray-900 mb-4 ${
          type === 'bprnd' ? 'text-4xl' : 'text-4xl'
        }`}>
          {type === 'bprnd' ? 'BPR&D POC Portal' : 'POC Portal Dashboard'}
        </h1>
        <p className={`text-gray-600 max-w-4xl ${
          type === 'bprnd' ? 'text-lg leading-relaxed' : 'text-lg'
        }`}>
          {type === 'bprnd'
            ? ''
            : 'Welcome to the POC (Proof of Concept) portal. Manage and monitor all POC activities from here.'}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <Card
            key={index}
            className={`transition-all duration-300 cursor-pointer overflow-hidden group ${
              type === 'bprnd' 
                ? 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-xl rounded-2xl shadow-md hover:-translate-y-1' 
                : 'bg-gray-100 hover:shadow-md rounded-xl'
            }`}
            onClick={() => navigate(card.path)}
          >
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-4 ${
              type === 'bprnd' ? 'pt-6 px-6' : 'pt-6'
            }`}>
              <CardTitle className={`font-semibold group-hover:text-gray-700 transition-colors ${
                type === 'bprnd' ? 'text-lg text-gray-900' : 'text-lg text-gray-900'
              }`}>
                {card.title}
              </CardTitle>
              <div className={`flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                type === 'bprnd' 
                  ? `h-14 w-14 rounded-xl ${card.bgColor} border border-gray-200 shadow-sm` 
                  : 'h-12 w-12 rounded-xl bg-gray-200'
              }`}>
                <card.icon className={`${
                  type === 'bprnd' ? `h-7 w-7 ${card.color}` : 'h-6 w-6 text-gray-800'
                }`} />
              </div>
            </CardHeader>
            <CardContent className={`pt-0 ${
              type === 'bprnd' ? 'px-6 pb-6' : ''
            }`}>
              <div className="space-y-3">
                <div className={`font-bold text-gray-900 ${
                  type === 'bprnd' ? 'text-3xl' : 'text-3xl'
                }`}>
                  {card.value}
                  {type === 'bprnd' && card.title === 'Students' && bprndStudentsLoading && (
                    <div className="inline-block ml-2 w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  )}
                  {type === 'bprnd' && card.title === 'Students' && bprndStudentsError && (
                    <div className="inline-block ml-2 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-xs">!</span>
                    </div>
                  )}
                </div>
                <p className={`text-gray-800 ${
                  type === 'bprnd' ? 'text-sm leading-relaxed' : 'text-sm'
                }`}>{card.description}</p>
                {type === 'bprnd' && (
                  <div className="pt-2">
                    <div className="w-full bg-gray-100 rounded-full h-1">
                      <div className="bg-gradient-to-r from-gray-400 to-gray-500 h-1 rounded-full transition-all duration-300 group-hover:from-gray-500 group-hover:to-gray-600" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            {type === 'bprnd' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
          </Card>
        ))}
      </div>
      </div>
    </div>
  );
};

export default POCPortalPage;
