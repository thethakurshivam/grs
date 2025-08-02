import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import MOUListPage from "./components/dashboard/MOUListPage";
import CompletedCoursesListPage from "./components/dashboard/CompletedCoursesListPage";
import OngoingCoursesListPage from "./components/dashboard/OngoingCoursesListPage";
import SchoolsListPage from "./components/dashboard/SchoolsListPage";
import SchoolMOUsPage from "./components/dashboard/SchoolMOUsPage";
import AddMOUForm from "./components/forms/AddMOUForm";
import AddCourseForm from "./components/forms/AddCourseForm";
import BulkImportForm from "./components/forms/BulkImportForm";
import BulkImportStudentsForm from "./components/forms/BulkImportStudentsForm";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import StudentLogin from "./pages/StudentLogin";
import StudentSignup from "./pages/StudentSignup";
import StudentDashboard from "./pages/StudentDashboard";
import StudentAvailableCourses from "./pages/StudentAvailableCourses";
import StudentCreditBank from "./pages/StudentCreditBank";
import { CompletedCoursesList } from "./pages/CompletedCoursesList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page - Root Route */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="mous" element={<MOUListPage />} />
            <Route path="completed-courses" element={<CompletedCoursesListPage />} />
            <Route path="ongoing-courses" element={<OngoingCoursesListPage />} />
            <Route path="schools" element={<SchoolsListPage />} />
            <Route path="schools/:schoolName" element={<SchoolMOUsPage />} />
            <Route path="add-mou" element={<AddMOUForm />} />
            <Route path="bulk-import-mou" element={
              <BulkImportForm 
                type="mou" 
                title="Bulk Import MOUs" 
                description="Upload multiple MOUs from a CSV or Excel file" 
              />
            } />
            <Route path="add-course" element={<AddCourseForm />} />
            <Route path="bulk-import-courses" element={
              <BulkImportForm 
                type="courses" 
                title="Bulk Import Courses" 
                description="Upload multiple courses from a CSV or Excel file" 
              />
            } />
            <Route path="bulk-import-students" element={<BulkImportStudentsForm />} />
          </Route>
          
          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/available-courses" element={<StudentAvailableCourses />} />
          <Route path="/student/completed-courses" element={<CompletedCoursesList />} />
          <Route path="/student/credit-bank" element={<StudentCreditBank />} />
          
          {/* Legacy Routes - Redirect to landing page */}
          <Route path="/login" element={<LandingPage />} />
          <Route path="/signup" element={<LandingPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
