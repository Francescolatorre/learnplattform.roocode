import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@theme/theme';
import { AuthProvider, useAuth } from '@features/auth/AuthContext'; // Ensure useAuth is imported
import ErrorBoundary from '@components/ErrorBoundary';
import LoginForm from '@features/auth/LoginForm';
import RegisterForm from '@features/auth/RegisterForm';
import { MainLayout } from '@components/layout/MainLayout';
import Dashboard from '@features/dashboard/Dashboard';
import ProgressTrackingUI from '@features/dashboard/ProgressTrackingUI';
import Profile from '@features/profile/Profile';
import CoursesPage from '@features/courses/CoursesPage';
import CourseTasksPage from '@pages/CourseTasksPage';
import EditCourse from '@features/courses/EditCourse';
import InstructorViews from '@features/instructor/InstructorViews';
import CourseDetailsPage from '@features/courses/CourseDetailsPage';
import CourseEnrollmentPage from '@features/courses/CourseEnrollmentPage';
import InstructorCoursesPage from '@features/instructor/InstructorCoursesPage';
import AdminCoursesPage from '@features/admin/AdminCoursesPage';
import TaskViewPage from '@pages/TaskViewPage';
import InstructorCourseDetailPage from '@pages/InstructorCourseDetailPage';
import StudentTasksPage from '@pages/StudentTasksPage';
import InstructorTasksPage from '@pages/InstructorTasksPage';
import AdminTasksPage from '@pages/AdminTasksPage';

type Task = {
  title: string;
  status: string;
  createdDate: string;
  creator: string;
  description: string;
  actions: string;
  courseId: string;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, refreshToken, userRole, isAuthChecked } = useAuth(); // Add isAuthChecked
  const isTokenAvailable = localStorage.getItem('access_token') !== null;
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isAuthenticated && isTokenAvailable) {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [isAuthenticated, isTokenAvailable, refreshToken]);

  if (loading || !isAuthChecked) { // Ensure auth check is complete
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient(); // Create a QueryClient instance

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider> {/* Ensure AuthProvider wraps the entire app */}
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
                <Route path="/courses" element={<ProtectedRoute><MainLayout><CourseEnrollmentPage /></MainLayout></ProtectedRoute>} />
                <Route path="/courses/:courseId/edit" element={<ProtectedRoute><MainLayout><EditCourse /></MainLayout></ProtectedRoute>} />
                <Route
                  path="/courses/:courseId/tasks"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <StudentTasksPage /> {/* New page for students */}
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/courses/:courseId/tasks/:taskId" element={<ProtectedRoute><MainLayout><TaskViewPage /></MainLayout></ProtectedRoute>} />
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
                <Route path="/my-submission" element={<ProtectedRoute><MainLayout><div>My Submission Page (Placeholder)</div></MainLayout></ProtectedRoute>} />
                <Route path="/enrollment" element={<ProtectedRoute><MainLayout><CourseEnrollmentPage /></MainLayout></ProtectedRoute>} />
                <Route path="/courses/:courseId/details" element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><MainLayout><CourseDetailsPage /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/courses/:courseId/details" element={<ProtectedRoute><MainLayout><InstructorCourseDetailPage /></MainLayout></ProtectedRoute>} />
                <Route
                  path="/instructor/courses/:courseId/tasks"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <InstructorTasksPage /> {/* New page for instructors */}
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses/:courseId/tasks"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AdminTasksPage /> {/* New page for admins */}
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/instructor/courses/:courseId/tasks/:taskId/edit"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <EditCourse /> {/* Reuse EditCourse for editing tasks */}
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
