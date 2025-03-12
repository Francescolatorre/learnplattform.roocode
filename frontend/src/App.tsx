import React from 'react';
import CourseDetailsPage from './features/courses/CoursesPage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import { AuthProvider } from './features/auth/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginForm from './features/auth/LoginForm';
import RegisterForm from './features/auth/RegisterForm';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './features/dashboard/Dashboard';
import Profile from './features/profile/Profile';
import CoursesPage from './features/courses/CoursesPage';
import CourseTasksPage from './features/courses/CourseTasksPage';
import CourseEditPage from './features/courses/CourseEditPage';

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
  const isAuthenticated = localStorage.getItem('access_token') !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><MainLayout><CoursesPage /></MainLayout></ProtectedRoute>} />
              <Route path="/courses/:courseId" element={<ProtectedRoute><MainLayout><CourseDetailsPage /></MainLayout></ProtectedRoute>} />
              <Route path="/courses/:courseId/edit" element={<ProtectedRoute><MainLayout><CourseEditPage /></MainLayout></ProtectedRoute>} />
              <Route path="/courses/:courseId/tasks" element={<ProtectedRoute><MainLayout><CourseTasksPage /></MainLayout></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
