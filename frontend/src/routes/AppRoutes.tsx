import React, {lazy} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';

import {StudentCoursesPage} from '@/pages/courses/StudentCoursesPage';
import EditCourse from 'src/components/courses/EditCourse';
import LoginPage from 'src/pages/auth/LoginPage';
import Dashboard from 'src/pages/DashboardPage';
import HomePage from 'src/pages/HomePage';
import StudentTasksPage from 'src/pages/learningTasks/StudentTasksPage';
import Profile from 'src/pages/Profile';
import ProtectedRoute from 'src/routes/ProtectedRoute';

const CourseDetailsPage = lazy(() => import('src/pages/courses/CourseDetailsPage'));

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <StudentCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/edit"
        element={
          <ProtectedRoute allowedRoles={['instructor', 'admin']}>
            <EditCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/tasks"
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <StudentTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/details"
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <CourseDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute>
            <CourseDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
