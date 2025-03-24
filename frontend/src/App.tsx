import React, { use, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@theme/theme'; // Ensure this matches the actual file structure
import { AuthProvider } from '@features/auth/AuthContext';
import ErrorBoundary from '@components/ErrorBoundary';
import LoginForm from '@features/auth/LoginForm';
import RegisterForm from '@features/auth/RegisterForm';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from '@features/dashboard/Dashboard';
import ProgressTrackingUI from '@features/dashboard/ProgressTrackingUI';
import Profile from '@features/profile/Profile';
import CoursesPage from '@features/courses/CoursesPage';
import CourseTasksPage from '@features/courses/CourseTasksPage';
import EditCourse from '@features/courses/EditCourse';
import InstructorViews from '@features/instructor/InstructorViews';
import CourseDetailsPage from './pages/CourseDetailsPage';
import CourseEnrollmentPage from '@features/courses/CourseEnrollmentPage';
import { useAuth } from '@features/auth/AuthContext';
import InstructorCoursesPage from '@features/instructor/InstructorCoursesPage';
import AdminCoursesPage from '@features/admin/AdminCoursesPage'; // Import AdminCoursesPage

type Task = {
  title: string;
  status: string;
  createdDate: string;
  creator: string;
  description: string;
  actions: string;
  courseId: string;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, refreshToken } = useAuth();
  const isTokenAvailable = localStorage.getItem('access_token') !== null;
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('ProtectedRoute: Initializing authentication...');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('isTokenAvailable:', isTokenAvailable);

      if (!isAuthenticated && isTokenAvailable) {
        try {
          console.log('Attempting to refresh token...');
          await refreshToken();
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [isAuthenticated, isTokenAvailable, refreshToken]);

  if (loading) {
    console.log('ProtectedRoute: Loading...');
    return <div>Loading...</div>; // Optionally replace with a loading spinner
  }

  console.log('ProtectedRoute: Authentication check complete. isAuthenticated:', isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const queryClient = new QueryClient(); // Create a QueryClient instance

const App: React.FC = () => {
  console.log('App component rendered'); // Debugging log

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}> {/* Wrap the app with QueryClientProvider */}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router
              future={{
                v7_startTransition: true, // Opt into React.startTransition wrapping
                v7_relativeSplatRoutes: true, // Opt into new relative splat route behavior
              }}
            >
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
                <Route path="/courses" element={<ProtectedRoute><MainLayout><CoursesPage /></MainLayout></ProtectedRoute>} />
                <Route path="/courses/:courseId" element={<ProtectedRoute><MainLayout><CourseEnrollmentPage /></MainLayout></ProtectedRoute>} />
                <Route path="/courses/:courseId/edit" element={<ProtectedRoute><MainLayout><EditCourse /></MainLayout></ProtectedRoute>} />
                <Route path="/courses-old/:courseId" element={<ProtectedRoute><MainLayout><CourseDetailsPage /></MainLayout></ProtectedRoute>} />
                <Route path="/courses/:courseId/tasks" element={<ProtectedRoute><MainLayout><CourseTasksPage /></MainLayout></ProtectedRoute>} />
                <Route path="/progress-tracking/:courseId" element={<ProtectedRoute><MainLayout><ProgressTrackingUI courseId={useParams().courseId} /></MainLayout></ProtectedRoute>} />
                <Route path="/instructor" element={<ProtectedRoute><MainLayout><InstructorViews /></MainLayout></ProtectedRoute>} />
                <Route
                  path="/instructor/courses"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <InstructorCoursesPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/instructor/courses/:courseId/edit" element={<ProtectedRoute><MainLayout><EditCourse /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/courses/:courseId/edit" element={<ProtectedRoute><MainLayout><EditCourse /></MainLayout></ProtectedRoute>} />
                <Route
                  path="/admin/courses"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AdminCoursesPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
