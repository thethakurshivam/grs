import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import AddMOUForm from "./components/forms/AddMOUForm";
import AddCourseForm from "./components/forms/AddCourseForm";
import BulkImportForm from "./components/forms/BulkImportForm";
import BulkImportStudentsForm from "./components/forms/BulkImportStudentsForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
