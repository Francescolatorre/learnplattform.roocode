// src/routes/AppRoutes.tsx
import React from 'react';
import {Routes, Route} from 'react-router-dom';
import CoursesPage from '@features/courses/pages/CoursesPage';
import CourseDetailPage from '@features/courses/pages/CourseDetailsPage';
import StudentTasksPage from '@features/learningTasks/pages/StudentTasksPage';
import InstructorViews from '@features/instructor/InstructorViews';
import AdminCoursesPage from '@features/admin/pages/AdminCoursesPage';
import TaskListPage from '@features/learningTasks/pages/TaskListPage';
import RoleBasedRoute from '@components/common/RoleBasedRoute';
import ProtectedRoute from '@components/common/ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />

      {/* Student routes */}
      <Route path="/courses/:courseId/tasks" element={<StudentTasksPage />} />

      {/* Instructor routes */}
      <Route path="/instructor" element={<InstructorViews />} />
      <Route
        path="/instructor/courses/:courseId/edit"
        element={
          <RoleBasedRoute allowedRoles={['instructor']}>
            <EditCoursePage />
          </RoleBasedRoute>
        }
      />

      {/* Admin routes */}
      <Route path="/admin/courses" element={<AdminCoursesPage />} />
      <Route
        path="/admin/courses/:courseId/edit"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <EditCoursePage />
          </RoleBasedRoute>
        }
      />

      {/* Shared routes */}
      <Route path="/tasks" element={<TaskListPage />} />
      <Route
        path="/courses/:courseId/details"
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <CourseDetailsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
