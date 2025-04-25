import React, {lazy} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';

import {StudentCoursesPage} from '@/pages/courses/StudentCoursesPage';
import EditCourse from '@/components/courses/EditCourse';
import LoginPage from '@/pages/auth/LoginPage';
import Dashboard from '@/pages/DashboardPage';
import HomePage from '@/pages/HomePage';
import StudentTasksPage from '@/pages/learningTasks/StudentTasksPage';
import Profile from '@/pages/Profile';
import ProtectedRoute from '@/routes/ProtectedRoute';
import InstructorDashboard from '@/components/dashboards/InstructorDashboard';

import AdminDashboard from '@/pages/admin/AdminDashboardPage';
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

// Lazy-loaded components
const CourseDetailsPage = lazy(() => import('@/pages/courses/StudentCourseDetailsPage'));
const InstructorCourseDetailsPage = lazy(() => import('@/pages/courses/InstructorCourseDetailsPage'));

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage register={true} />} />

      {/* Student Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <CourseDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            {/* Profile page for all roles */}
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Instructor Routes */}
      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <AdminCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/new"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <EditCourse isNew={true} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/edit"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <EditCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <InstructorCourseDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes - CHECK THIS SECTION */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect to profile if no route matches */}
      <Route path="*" element={<Navigate to="/profile" replace />} />
    </Routes>
  );
};

export default AppRoutes;
