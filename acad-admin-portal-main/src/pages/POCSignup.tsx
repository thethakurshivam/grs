import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Activity, ArrowLeft } from 'lucide-react';

interface POCSignupProps {
  isBPRND?: boolean;
}

const POCSignup: React.FC<POCSignupProps> = ({ isBPRND = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    organization: '',
    mous: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/${isBPRND ? 'poc' : 'poc'}/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            mobileNumber: formData.mobileNumber,
            organization: formData.organization,
            mous: formData.mous
              .split(',')
              .map((mou) => mou.trim())
              .filter((mou) => mou), // Convert comma-separated string to array
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication data
        localStorage.setItem('pocToken', data.token);
        localStorage.setItem('pocUser', JSON.stringify(data.data));
        localStorage.setItem('pocUserId', data.data._id);
        localStorage.setItem('isPOCAuthenticated', 'true');

        toast({
          title: 'Registration Successful',
          description: `Welcome, ${data.data.name}! Your account has been created.`,
        });

        // Navigate to POC portal after a short delay
        setTimeout(() => {
          navigate(isBPRND ? '/poc-portal/bprnd' : '/poc-portal');
        }, 1000);
      } else {
        toast({
          title: 'Registration Failed',
          description: data.error || 'Registration failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isBPRND
                ? 'BPR&D POC Portal Registration'
                : 'POC Portal Registration'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Create your {isBPRND ? 'BPR&D POC' : 'POC'} account to access the
              management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="mobileNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Mobile Number
                </Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="organization"
                  className="text-sm font-medium text-gray-700"
                >
                  Organization
                </Label>
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Enter your organization name"
                  value={formData.organization}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="mous"
                  className="text-sm font-medium text-gray-700"
                >
                  MOU IDs (comma-separated)
                </Label>
                <Input
                  id="mous"
                  name="mous"
                  type="text"
                  placeholder="Enter MOU IDs separated by commas"
                  value={formData.mous}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Back to Portal Selection */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POCSignup;
