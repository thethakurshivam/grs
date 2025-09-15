import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface DisciplineData {
  [key: string]: number;
}

interface AnalyticsResponse {
  success: boolean;
  data: DisciplineData;
  totalCourses: number;
  disciplineCount: number;
}

const BPRNDAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<DisciplineData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState<number>(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('pocToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch('http://localhost:3003/api/bprnd/disciplines/count', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch analytics data');
      }

      const result: AnalyticsResponse = await response.json();
      setAnalyticsData(result.data);
      setTotalCourses(result.totalCourses);
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Chart.js configuration
  const chartData = {
    labels: Object.keys(analyticsData),
    datasets: [
      {
        data: Object.values(analyticsData),
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Amber
          '#EF4444', // Red
          '#8B5CF6', // Purple
          '#06B6D4', // Cyan
          '#F97316', // Orange
          '#EC4899', // Pink
        ],
        borderColor: [
          '#1E40AF', // Darker Blue
          '#047857', // Darker Green
          '#D97706', // Darker Amber
          '#DC2626', // Darker Red
          '#7C3AED', // Darker Purple
          '#0891B2', // Darker Cyan
          '#EA580C', // Darker Orange
          '#DB2777', // Darker Pink
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500' as const,
          },
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#6B7280',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / totalCourses) * 100).toFixed(1);
            return `${label}: ${value} courses (${percentage}%)`;
          },
        },
      },
      title: {
        display: true,
        text: 'Course Distribution by Discipline',
        font: {
          size: 18,
          weight: '600' as const,
        },
        color: '#111827',
        padding: 20,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
            <p className="text-center mt-4 text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchAnalyticsData} className="bg-gray-800 hover:bg-gray-900 text-white">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/poc-portal/bprnd')}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 whitespace-nowrap text-base"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">Students Analytics</h1>
              <p className="text-base text-gray-500">Visualize course distribution and student performance insights</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalCourses}</div>
              <p className="text-sm text-gray-500 mt-1">Across all disciplines</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Disciplines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{Object.keys(analyticsData).length}</div>
              <p className="text-sm text-gray-500 mt-1">Active disciplines</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Avg Courses/Discipline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {Object.keys(analyticsData).length > 0 
                  ? Math.round(totalCourses / Object.keys(analyticsData).length)
                  : 0
                }
              </div>
              <p className="text-sm text-gray-500 mt-1">Per discipline</p>
            </CardContent>
          </Card>
        </div>

        {/* Pie Chart */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              Course Distribution by Discipline
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Visual representation of courses across different academic disciplines
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-96 w-full">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Discipline Details */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <CardTitle className="text-lg text-gray-800">Discipline Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analyticsData).map(([discipline, count], index) => {
                const percentage = ((count / totalCourses) * 100).toFixed(1);
                const colors = [
                  'bg-blue-100 text-blue-800 border-blue-200',
                  'bg-green-100 text-green-800 border-green-200',
                  'bg-amber-100 text-amber-800 border-amber-200',
                  'bg-red-100 text-red-800 border-red-200',
                  'bg-purple-100 text-purple-800 border-purple-200',
                  'bg-cyan-100 text-cyan-800 border-cyan-200',
                  'bg-orange-100 text-orange-800 border-orange-200',
                  'bg-pink-100 text-pink-800 border-pink-200',
                ];
                
                return (
                  <div
                    key={discipline}
                    className={`p-4 rounded-lg border ${colors[index % colors.length]} transition-all duration-200 hover:scale-105`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{discipline}</h3>
                      <span className="text-xs font-medium">{percentage}%</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{count}</div>
                    <p className="text-xs opacity-75 mt-1">courses</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BPRNDAnalyticsPage;
