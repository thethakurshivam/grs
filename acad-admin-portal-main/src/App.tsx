import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardOverview from './components/dashboard/DashboardOverview';
import MOUListPage from './components/dashboard/MOUListPage';
import CompletedCoursesListPage from './components/dashboard/CompletedCoursesListPage';
import OngoingCoursesListPage from './components/dashboard/OngoingCoursesListPage';
import UpcomingCoursesListPage from './components/dashboard/UpcomingCoursesListPage';
import SchoolsListPage from './components/dashboard/SchoolsListPage';
import SchoolMOUsPage from './components/dashboard/SchoolMOUsPage';
import AddMOUForm from './components/forms/AddMOUForm';
import AddCourseForm from './components/forms/AddCourseForm';
import BulkImportForm from './components/forms/BulkImportForm';
import BulkImportStudentsForm from './components/forms/BulkImportStudentsForm';
import PreviousCoursesForm from './components/student/PreviousCoursesForm';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import StudentDashboard from './pages/StudentDashboard';
import StudentAvailableCourses from './pages/StudentAvailableCourses';
import StudentCreditBank from './pages/StudentCreditBank';
import StudentProfile from './pages/StudentProfile';
import BPRNDStudentProfile from './pages/BPRNDStudentProfile';
import BPRNDStudentProfileAPI from './pages/BPRNDStudentProfileAPI';
import BPRNDCertifications from './pages/BPRNDCertifications';
import BPRNDClaimCredits from './pages/BPRNDClaimCredits';
import BPRNDTrainingCalendar from './pages/BPRNDTrainingCalendar';
import { CompletedCoursesList } from './pages/CompletedCoursesList';
import EnrolledCoursesList from './pages/EnrolledCoursesList';
import SectorTrainingFields from './pages/SectorTrainingFields';
import FieldCourses from './pages/FieldCourses';
import { BPRNDStudentDashboard } from './components/student/BPRNDStudentDashboard';

// POC Portal Components
import POCPortalPage from './components/dashboard/POCPortalPage';
import POCStudentsPage from './components/dashboard/POCStudentsPage';
import POCStudentsListPage from './components/dashboard/POCStudentsListPage';
import POCCoursesPage from './components/dashboard/POCCoursesPage';
import POCCoursesListPage from './components/dashboard/POCCoursesListPage';
import POCMOUsPage from './components/dashboard/POCMOUsPage';
import POCMOUsListPage from './components/dashboard/POCMOUsListPage';
import POCRequestsPage from './components/dashboard/POCRequestsPage';
import POCLayout from './components/dashboard/POCLayout';
import POCBulkImportStudentsPage from './components/dashboard/POCBulkImportStudentsPage';
import POCLogin from './pages/POCLogin';
import POCSignup from './pages/POCSignup';
import POCAuthGuard from './components/auth/POCAuthGuard';
import StudentAuthGuard from './components/auth/StudentAuthGuard';
import AdminBPRNDClaimsPage from './components/dashboard/AdminBPRNDClaimsPage';
import POCBPRNDClaimsPage from './components/dashboard/POCBPRNDClaimsPage';
import BPRNDStudentClaimsPage from './components/student/BPRNDStudentClaimsPage';
import BPRNDCertificationRequestPage from './components/dashboard/BPRNDCertificationRequestPage';
import BPRNDPendingCreditsPage from './components/dashboard/BPRNDPendingCreditsPage';

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
            <Route
              path="completed-courses"
              element={<CompletedCoursesListPage />}
            />
            <Route
              path="ongoing-courses"
              element={<OngoingCoursesListPage />}
            />
            <Route
              path="upcoming-courses"
              element={<UpcomingCoursesListPage />}
            />
            <Route path="schools" element={<SchoolsListPage />} />
            <Route path="schools/:schoolName" element={<SchoolMOUsPage />} />
            <Route path="add-mou" element={<AddMOUForm />} />
            <Route
              path="bulk-import-mou"
              element={
                <BulkImportForm
                  type="mou"
                  title="Bulk Import MOUs"
                  description="Upload multiple MOUs from a CSV or Excel file"
                />
              }
            />
            <Route path="add-course" element={<AddCourseForm />} />
            <Route
              path="bulk-import-courses"
              element={
                <BulkImportForm
                  type="courses"
                  title="Bulk Import Courses"
                  description="Upload multiple courses from a CSV or Excel file"
                />
              }
            />
            <Route
              path="bulk-import-students"
              element={<BulkImportStudentsForm />}
            />
            <Route path="sector-training" element={<SectorTrainingFields />} />
            <Route path="sector-training/:fieldId" element={<FieldCourses />} />
            <Route path="field-courses/:fieldId" element={<FieldCourses />} />
            <Route path="bprnd/claims" element={<AdminBPRNDClaimsPage />} />
            <Route path="bprnd-certification-request" element={<BPRNDCertificationRequestPage />} />
            <Route path="bprnd-pending-credits" element={<BPRNDPendingCreditsPage />} />
          </Route>

          {/* POC Authentication Routes */}
          <Route path="/poc/login" element={<POCLogin />} />
          <Route path="/poc/signup" element={<POCSignup />} />

          {/* BPRND POC Routes */}
          <Route path="/poc/bprnd/login" element={<POCLogin isBPRND />} />
          <Route path="/poc/bprnd/signup" element={<POCSignup isBPRND />} />

          {/* POC Portal Routes (Protected with Authentication) */}
          <Route
            path="/poc-portal"
            element={
              <POCAuthGuard>
                <POCLayout />
              </POCAuthGuard>
            }
          >
            <Route index element={<POCPortalPage />} />
            <Route path="students" element={<POCStudentsPage />} />
            <Route path="students/list" element={<POCStudentsListPage />} />
            <Route
              path="bulk-import-students"
              element={<POCBulkImportStudentsPage />}
            />
            <Route path="courses" element={<POCCoursesListPage />} />
            <Route path="mous" element={<POCMOUsListPage />} />
            <Route path="requests" element={<POCRequestsPage />} />
            <Route path="bprnd/claims" element={<POCBPRNDClaimsPage />} />
          </Route>

          {/* BPRND POC Portal Routes (Protected with Authentication) */}
          <Route
            path="/poc-portal/bprnd"
            element={
              <POCAuthGuard>
                <POCLayout type="bprnd" />
              </POCAuthGuard>
            }
          >
            <Route index element={<POCPortalPage type="bprnd" />} />
            <Route path="students" element={<POCStudentsPage type="bprnd" />} />
            <Route
              path="students/list"
              element={<POCStudentsListPage type="bprnd" />}
            />
            <Route
              path="bulk-import-students"
              element={<POCBulkImportStudentsPage type="bprnd" />}
            />
            <Route
              path="courses"
              element={<POCCoursesListPage type="bprnd" />}
            />
            <Route path="mous" element={<POCMOUsListPage type="bprnd" />} />
            <Route path="requests" element={<POCRequestsPage type="bprnd" />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route
            path="/student/available-courses"
            element={<StudentAvailableCourses />}
          />
          <Route
            path="/student/completed-courses"
            element={<CompletedCoursesList />}
          />
          <Route
            path="/student/:studentId/enrolled-courses"
            element={<EnrolledCoursesList />}
          />
          <Route path="/student/credit-bank" element={<StudentCreditBank />} />
          <Route
            path="/student/previous-courses"
            element={<PreviousCoursesForm />}
          />

          {/* BPRND Student Routes */}
          <Route
            path="/student/bprnd/login"
            element={<StudentLogin isBPRND />}
          />
          <Route
            path="/student/bprnd/signup"
            element={<StudentSignup isBPRND />}
          />
          {/* Default redirect to dashboard for BPRND root */}
          <Route
            path="/student/bprnd"
            element={<BPRNDStudentDashboard />}
          />
          <Route
            path="/student/bprnd/profile-api"
            element={<BPRNDStudentProfileAPI />}
          />
          <Route
            path="/student/bprnd/profile"
            element={<BPRNDStudentProfile />}
          />
          <Route
            path="/student/bprnd/dashboard"
            element={<BPRNDStudentDashboard />}
          />
          <Route
            path="/student/bprnd/certifications"
            element={<BPRNDCertifications />}
          />
          <Route
            path="/student/bprnd/claim-credits"
            element={<BPRNDClaimCredits />}
          />
          <Route
            path="/student/bprnd/claims"
            element={<BPRNDStudentClaimsPage />}
          />
          <Route
            path="/student/bprnd/training-calendar"
            element={<BPRNDTrainingCalendar />}
          />
          <Route
            path="/student/bprnd/credit-bank"
            element={<StudentCreditBank />}
          />
          <Route
            path="/student/bprnd/previous-courses"
            element={<PreviousCoursesForm />}
          />

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
