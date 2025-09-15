import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { BookOpen, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface StudentLoginPageProps {
  isBPRND?: boolean;
}

const StudentLoginPage: React.FC<StudentLoginPageProps> = ({
  isBPRND = false,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      // API call to backend login endpoint
      const apiUrl = isBPRND
        ? 'http://localhost:3004/api/bprnd/student/login' // BPRND API (api4.js) - direct call to port 3004
        : 'http://localhost:3001/api/students/login'; // Regular student API (api1.js) - direct call to port 3001

      console.log('🔗 Login API URL:', apiUrl, 'isBPRND:', isBPRND);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear all session keys to avoid cross-portal bleed
        localStorage.removeItem('isStudentAuthenticated');
        localStorage.removeItem('studentToken');
        localStorage.removeItem('bprndIsAuthenticated');
        localStorage.removeItem('bprndStudentToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('pocToken');
        localStorage.removeItem('pocUser');
        localStorage.removeItem('pocUserId');
        localStorage.removeItem('isPOCAuthenticated');

        if (isBPRND) {
          // BPR&D session keys
          localStorage.setItem('bprndIsAuthenticated', 'true');
          if (data.token) localStorage.setItem('bprndStudentToken', data.token);

          // Store BPRND student information
          localStorage.setItem('studentEmail', data.student.email);
          localStorage.setItem('studentName', data.student.Name);
          localStorage.setItem('bprndStudentId', data.student._id);

          // Professional information
          localStorage.setItem('studentDesignation', data.student.Designation || '');
          localStorage.setItem('studentState', data.student.State || '');
          localStorage.setItem('studentDepartment', data.student.Department || '');
          localStorage.setItem('studentEmployeeId', data.student.EmployeeId || '');

          // Training information
          localStorage.setItem('studentUmbrella', data.student.Umbrella || '');

          // Contact information
          localStorage.setItem('studentPhone', data.student.Phone || '');
          localStorage.setItem('studentJoiningDate', data.student.JoiningDate || '');

          // Complete data backup
          localStorage.setItem('bprndStudentData', JSON.stringify(data.student));
        } else {
          // Normal student session keys
          localStorage.setItem('isStudentAuthenticated', 'true');
          if (data.token) localStorage.setItem('studentToken', data.token);

          // Store regular student information
          localStorage.setItem('studentEmail', data.student.email);
          localStorage.setItem('studentName', data.student.full_name);
          localStorage.setItem('studentId', data.student.id);
        }

        toast({
          title: 'Success',
          description: data.message || 'Login successful!',
        });
        navigate(isBPRND ? '/student/bprnd/dashboard' : '/student/dashboard');
      } else {
        toast({
          title: 'Error',
          description:
            data.error || 'Login failed. Please check your credentials.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description:
          'Network error. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-university-blue-light to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
                  <h1 className="text-3xl font-bold text-primary">
          {isBPRND ? 'BPR&D Trainee Portal' : 'Student Portal'}
        </h1>
        <p className="text-gray-800 mt-2 font-medium">
          Sign in to your {isBPRND ? 'BPR&D candidate' : 'student'} account
        </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 font-bold">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800 font-semibold">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 text-black placeholder:text-gray-500 border-gray-300 focus:border-[#0b2e63] focus:ring-[#0b2e63]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-800 font-semibold"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 text-black placeholder:text-gray-500 border-gray-300 focus:border-[#0b2e63] focus:ring-[#0b2e63]"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-700 font-medium">
                Don't have an account?{' '}
                <button
                  onClick={() =>
                    navigate(
                      isBPRND ? '/student/bprnd/signup' : '/student/signup'
                    )
                  }
                  className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentLoginPage;
