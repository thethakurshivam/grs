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

interface POCLoginProps {
  isBPRND?: boolean;
}

const POCLogin: React.FC<POCLoginProps> = ({ isBPRND = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:${isBPRND ? '3003' : '3002'}/api/${
          isBPRND ? 'bprnd/poc' : 'poc'
        }/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication data
        localStorage.setItem('pocToken', data.token);
        localStorage.setItem('pocUser', JSON.stringify(data.user));
        localStorage.setItem('pocUserId', data.user._id);
        localStorage.setItem('isPOCAuthenticated', 'true');

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.user.name}!`,
        });

        // Navigate to POC portal after a short delay
        setTimeout(() => {
          navigate(isBPRND ? '/poc-portal/bprnd' : '/poc-portal');
        }, 1000);
      } else {
        toast({
          title: 'Login Failed',
          description: data.error || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={
        isBPRND
          ? 'min-h-screen bg-blue-50 text-black flex items-center justify-center p-6'
          : 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'
      }
    >
      <div className="w-full max-w-md">
        <Card
          className={
            isBPRND
              ? 'bg-white shadow-xl border border-[#0b2e63]'
              : 'shadow-xl border-0'
          }
        >
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div
                className={
                  isBPRND
                    ? 'bg-[#0b2e63] p-3 rounded-full'
                    : 'bg-blue-600 p-3 rounded-full'
                }
              >
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
              <CardTitle
              className={
                isBPRND
                  ? 'text-2xl font-bold text-[#0b2e63]'
                  : 'text-2xl font-bold text-gray-900'
              }
            >
              {isBPRND ? 'BPR&D POC Portal Login' : 'POC Portal Login'}
            </CardTitle>
            <CardDescription className={isBPRND ? 'text-black/70' : 'text-gray-600'}>
              Access your {isBPRND ? 'BPR&D POC' : 'POC'} management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className={isBPRND ? 'text-sm font-medium text-black' : 'text-sm font-medium text-gray-700'}
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={
                    isBPRND
                      ? 'w-full focus-visible:ring-[#0b2e63] text-black placeholder:text-gray-500'
                      : 'w-full text-black placeholder:text-gray-500'
                  }
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className={isBPRND ? 'text-sm font-medium text-black' : 'text-sm font-medium text-gray-700'}
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={
                    isBPRND
                      ? 'w-full focus-visible:ring-[#0b2e63] text-black placeholder:text-gray-500'
                      : 'w-full text-black placeholder:text-gray-500'
                  }
                />
              </div>
              <Button
                type="submit"
                className={
                  isBPRND
                    ? 'w-full bg-[#0b2e63] hover:bg-[#09264f] text-white'
                    : 'w-full bg-blue-600 hover:bg-blue-700'
                }
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Back to Portal Selection */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                className={
                  isBPRND
                    ? 'w-full border-[#0b2e63] text-[#0b2e63] hover:bg-blue-50'
                    : 'w-full'
                }
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

export default POCLogin;
