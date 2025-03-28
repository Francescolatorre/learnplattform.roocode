import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import LoginForm from '@features/auth/LoginForm';
import RegisterForm from '@features/auth/RegisterForm';
import Dashboard from '@features/dashboard/Dashboard';
import Profile from '@features/profile/Profile';
import CourseEnrollmentPage from '@features/courses/CourseEnrollmentPage';
import EditCourse from '@features/courses/EditCourse';
import StudentTasksPage from '@pages/StudentTasksPage';
import TaskViewPage from '@pages/TaskViewPage';
import ProgressTrackingUI from '@features/dashboard/ProgressTrackingUI';
import InstructorViews from '@features/instructor/InstructorViews';
import InstructorCoursesPage from '@features/instructor/InstructorCoursesPage';
import AdminCoursesPage from '@features/admin/AdminCoursesPage';
import CourseDetailsPage from '@features/courses/CourseDetailsPage';
import InstructorCourseDetailPage from '@pages/InstructorCourseDetailPage';
import AdminTasksPage from '@pages/AdminTasksPage';
import InstructorTasksPage from '@pages/InstructorTasksPage';
import StudentDashboard from '@features/dashboard/StudentDashboard';
import InstructorDashboard from '@features/dashboard/InstructorDashboard';
import AdminDashboard from '@features/dashboard/AdminDashboard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CourseEnrollmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/edit"
        element={
          <ProtectedRoute>
            <EditCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/tasks"
        element={
          <ProtectedRoute>
            <StudentTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/tasks/:taskId"
        element={
          <ProtectedRoute>
            <TaskViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress-tracking/:courseId"
        element={
          <ProtectedRoute>
            <ProgressTrackingUI />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor"
        element={
          <ProtectedRoute>
            <InstructorViews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses"
        element={
          <ProtectedRoute>
            <InstructorCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute>
            <AdminCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/details"
        element={
          <ProtectedRoute>
            <CourseDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:courseId/details"
        element={
          <ProtectedRoute>
            <InstructorCourseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/tasks"
        element={
          <ProtectedRoute>
            <InstructorTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:courseId/tasks"
        element={
          <ProtectedRoute>
            <AdminTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/instructor"
        element={
          <ProtectedRoute>
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
