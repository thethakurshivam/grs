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

const AdminAnalyticsPage: React.FC = () => {
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
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch('http://localhost:3000/admin/disciplines/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AnalyticsResponse = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
        setTotalCourses(result.totalCourses);
      } else {
        throw new Error(result.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for the pie chart
  const chartData = {
    labels: Object.keys(analyticsData),
    datasets: [
      {
        data: Object.values(analyticsData),
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Yellow
          '#EF4444', // Red
          '#8B5CF6', // Purple
          '#06B6D4', // Cyan
          '#84CC16', // Lime
          '#F97316', // Orange
          '#EC4899', // Pink
          '#6B7280', // Gray
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Course Distribution by Discipline',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} courses (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/bprnd')} className="hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BPR&D Analytics</h1>
            <p className="text-sm text-gray-800">Loading analytics data...</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 animate-pulse text-gray-700 mx-auto mb-4" />
            <p className="text-gray-800">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/bprnd')} className="hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BPR&D Analytics</h1>
            <p className="text-sm text-gray-800">Error loading analytics data</p>
          </div>
        </div>
        
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAnalyticsData} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/bprnd')} className="hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BPR&D Analytics</h1>
            <p className="text-sm text-gray-800">Course distribution and program insights</p>
          </div>
        </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Total Courses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalCourses}</div>
            <p className="text-xs text-gray-700">Across all disciplines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Disciplines</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{Object.keys(analyticsData).length}</div>
            <p className="text-xs text-gray-700">Active disciplines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Average per Discipline</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(analyticsData).length > 0 
                ? Math.round(totalCourses / Object.keys(analyticsData).length)
                : 0
              }
            </div>
            <p className="text-xs text-gray-700">Courses per discipline</p>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Course Distribution by Discipline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Discipline Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Discipline Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analyticsData)
              .sort(([,a], [,b]) => b - a)
              .map(([discipline, count], index) => {
                const percentage = ((count / totalCourses) * 100).toFixed(1);
                return (
                  <div key={discipline} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[index % chartData.datasets[0].backgroundColor.length] }}></div>
                      <span className="font-medium text-gray-900">{discipline}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{count} courses</div>
                      <div className="text-sm text-gray-700">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsPage;
