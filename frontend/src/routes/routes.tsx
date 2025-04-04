import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';

import ProtectedRoute from '@features/auth/routes/ProtectedRoute';
import LoginPage from '@features/auth/pages/LoginPage';
import RegisterForm from '@features/auth/components/RegisterForm';
import Dashboard from '@features/dashboard/pages/Dashboard';
import Profile from '@features/profile/Profile';
import HomePage from '@features/home/pages/HomePage';
import StudentCourseEnrollmentPage from '@features/courses/pages/StudentCourseEnrollmentPage';
import EditCourse from '@features/courses/components/EditCourse';
import StudentTasksPage from '@features/learningTasks/pages/StudentTasksPage';
import TaskViewPage from '@features/learningTasks/pages/TaskViewPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentCourseEnrollmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/edit"
        element={
          <ProtectedRoute allowedRoles={["instructor", "admin"]}>
            <EditCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/tasks"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/tasks/:taskId"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <TaskViewPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
