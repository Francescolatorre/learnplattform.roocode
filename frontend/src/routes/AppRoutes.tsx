// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from '@features/home/pages/HomePage';
import CoursesPage from '@features/courses/pages/CoursesPage';
import CourseDetailPage from '@features/courses/pages/CourseDetailsPage';
import StudentTasksPage from '@features/learningTasks/pages/StudentTasksPage';
import AdminCoursesPage from '@features/admin/pages/AdminCoursesPage';
import TaskListPage from '@features/learningTasks/pages/TaskListPage';
import RoleBasedRoute from '@components/common/RoleBasedRoute';
import ProtectedRoute from '@components/common/ProtectedRoute';
import InstructorEditCoursePage from '@features/courses/pages/InstructorEditCoursePage';
import { LoginForm } from '@features/auth';
import Profile from '@features/profile/Profile';
import StudentDashboard from '@features/dashboard/StudentDashboard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginForm />} />
      {/* Public routes */}
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />

      {/* Student routes */}
      <Route path="/courses/:courseId/tasks" element={<StudentTasksPage />} />
      <Route path="/dashboard" element={<StudentDashboard />} />

      {/* Instructor routes */}
      <Route
        path="/instructor/courses/:courseId/edit"
        element={
          <RoleBasedRoute allowedRoles={['instructor']}>
            <InstructorEditCoursePage />
          </RoleBasedRoute>
        }
      />

      {/* Admin routes */}
      <Route path="/admin/courses" element={<AdminCoursesPage />} />
      <Route
        path="/admin/courses/:courseId/edit"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <InstructorEditCoursePage />
          </RoleBasedRoute>
        }
      />

      {/* Shared routes */}
      <Route path="/tasks" element={<TaskListPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route
        path="/courses/:courseId/details"
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
