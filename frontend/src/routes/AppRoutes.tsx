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
import LearningTaskViewPage from '@/pages/learningTasks/LearningTaskViewPage';
import StudentTasksPage from '@/pages/learningTasks/StudentTasksPage';
import ProfilePage from '@/pages/ProfilePage';
import RegisterFormPage from '@/pages/RegisterFormPage';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { UserRoleEnum } from '@/types/userTypes';

// Student pages
// Instructor pages
// Admin pages

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
          <ProtectedRoute allowedRoles={[UserRoleEnum.STUDENT]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.STUDENT]}>
            <StudentCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.STUDENT, UserRoleEnum.INSTRUCTOR]}>
            <StudentCourseDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:taskId"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.STUDENT, UserRoleEnum.INSTRUCTOR, UserRoleEnum.ADMIN]}>
            <LearningTaskViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.STUDENT, UserRoleEnum.INSTRUCTOR, UserRoleEnum.ADMIN]}>
            <StudentTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.STUDENT, UserRoleEnum.INSTRUCTOR, UserRoleEnum.ADMIN]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Instructor Routes */}
      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.INSTRUCTOR, UserRoleEnum.ADMIN]}>
            <InstructorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.INSTRUCTOR, UserRoleEnum.ADMIN]}>
            <InstructorCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/new"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.INSTRUCTOR, UserRoleEnum.ADMIN]}>
            <InstructorEditCoursePage isNew={true} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/edit"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.INSTRUCTOR, UserRoleEnum.ADMIN]}>
            <InstructorEditCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.INSTRUCTOR, UserRoleEnum.ADMIN]}>
            <InstructorCourseDetailPage />
          </ProtectedRoute>
        }
      />
      {/* Task Management Routes */}
      <Route
        path="/instructor/courses/:courseId/tasks"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.INSTRUCTOR, UserRoleEnum.ADMIN]}>
            <InstructorTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/tasks/:taskId/edit"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.INSTRUCTOR, UserRoleEnum.ADMIN]}>
            <CourseLearningTasksPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN]}>
            <AdminCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN]}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN]}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.ADMIN]}>
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress"
        element={
          <ProtectedRoute allowedRoles={[UserRoleEnum.STUDENT]}>
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
