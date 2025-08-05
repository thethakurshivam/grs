import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  Search, 
  Plus, 
  Filter,
  Clock,
  Users,
  Calendar,
  Star,
  Play
} from 'lucide-react';

interface CoursesPageProps {
  user: any;
  onLogout: () => void;
}

const CoursesPage = ({ user, onLogout }: CoursesPageProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data for courses
  const [courses] = useState([
    {
      id: 1,
      title: 'Introduction to Computer Science',
      instructor: 'Dr. Sarah Johnson',
      duration: '12 weeks',
      students: 45,
      rating: 4.8,
      status: 'active',
      category: 'Computer Science',
      startDate: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Business Management Fundamentals',
      instructor: 'Prof. Michael Chen',
      duration: '8 weeks',
      students: 32,
      rating: 4.6,
      status: 'active',
      category: 'Business',
      startDate: '2024-02-01',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Advanced Mathematics',
      instructor: 'Dr. Emily Davis',
      duration: '16 weeks',
      students: 28,
      rating: 4.9,
      status: 'upcoming',
      category: 'Mathematics',
      startDate: '2024-03-15',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop'
    },
    {
      id: 4,
      title: 'Psychology and Human Behavior',
      instructor: 'Prof. Robert Wilson',
      duration: '10 weeks',
      students: 38,
      rating: 4.7,
      status: 'active',
      category: 'Psychology',
      startDate: '2024-01-20',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop'
    },
    {
      id: 5,
      title: 'Engineering Design Principles',
      instructor: 'Dr. Lisa Thompson',
      duration: '14 weeks',
      students: 25,
      rating: 4.5,
      status: 'completed',
      category: 'Engineering',
      startDate: '2023-09-01',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop'
    }
  ]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || course.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600 mt-2">
                Manage and view all available courses
              </p>
            </div>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by title, instructor, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Courses</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  by {course.instructor}
                </p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{course.students} students</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{course.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{course.category}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Starts {new Date(course.startDate).toLocaleDateString()}</span>
                  </div>
                  <button className="btn-primary flex items-center space-x-1">
                    <Play className="h-4 w-4" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CoursesPage; 