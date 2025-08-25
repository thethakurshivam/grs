import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, User, Lock } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // API call to backend login endpoint (admin routes in api.js)
      const response = await fetch('/api/login', {
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
        // Clear any existing POC/student tokens to prevent conflicts
        localStorage.removeItem("pocToken");
        localStorage.removeItem("pocUser");
        localStorage.removeItem("pocUserId");
        localStorage.removeItem("isPOCAuthenticated");
        localStorage.removeItem("studentToken");
        localStorage.removeItem("isStudentAuthenticated");
        localStorage.removeItem("bprndStudentToken");
        localStorage.removeItem("bprndIsAuthenticated");
        
        // Store authentication data
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", data.admin.email);
        localStorage.setItem("userName", data.admin.name);
        localStorage.setItem("authToken", data.token);
        
        toast({
          title: "Success",
          description: data.message || "Login successful!",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Error",
          description: data.error || "Login failed. Please check your credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
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
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary">University Admin</h1>
          <p className="text-gray-800 mt-2 font-medium">Sign in to your admin panel</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-gray-900 font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800 font-semibold">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
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
                <Label htmlFor="password" className="text-gray-800 font-semibold">Password</Label>
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
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-700 font-medium">
              Don't have an account?{" "}
              <a href="/admin/signup" className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold">
                Sign up
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;