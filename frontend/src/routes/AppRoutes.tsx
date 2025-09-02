import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Page imports with consistent naming (all end with "Page")
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import LoginPage from '@/pages/auth/LoginPage';
import CourseProgressPage from '@/pages/courses/CourseProgressPage';
import InstructorCourseDetailPage from '@/pages/courses/InstructorCourseDetailsPage';
import InstructorCoursesPage from '@/pages/courses/InstructorCoursesPage';
import InstructorEditCoursePage from '@/pages/courses/InstructorEditCoursePage';
import StudentCourseDetailsPage from '@/pages/courses/StudentCourseDetailsPage';
import StudentCoursesPage from '@/pages/courses/StudentCoursesPage';
import DashboardPage from '@/pages/DashboardPage';
import HomePage from '@/pages/HomePage';
import InstructorDashboardPage from '@/pages/instructor/InstructorDashboardPage';
import CourseLearningTasksPage from '@/pages/learningTasks/CourseLearningTasksPage';
import InstructorTasksPage from '@/pages/learningTasks/InstructorTasksPage';
import StudentTasksPage from '@/pages/learningTasks/StudentTasksPage';
import ProfilePage from '@/pages/ProfilePage';
import RegisterFormPage from '@/pages/RegisterFormPage';

// Student pages

// Instructor pages

// Admin pages
import ProtectedRoute from '@/routes/ProtectedRoute';

/**
 * Main Application Routes Component
 * Defines all routes and their protection levels
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterFormPage />} />

      {/* Student Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardPage />
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
          <ProtectedRoute allowedRoles={['student', 'instructor']}>
            <StudentCourseDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <StudentTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Instructor Routes */}
      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <InstructorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <InstructorCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/new"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <InstructorEditCoursePage isNew={true} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/edit"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <InstructorEditCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <InstructorCourseDetailPage />
          </ProtectedRoute>
        }
      />
      {/* Task Management Routes */}
      <Route
        path="/instructor/courses/:courseId/tasks"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <InstructorTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/tasks/:taskId/edit"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <CourseLearningTasksPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCoursesPage />
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

      <Route
        path="/progress"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <CourseProgressPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect to profile if no route matches */}
      <Route path="*" element={<Navigate to="/profile" replace />} />
    </Routes>
  );
};

export default AppRoutes;
