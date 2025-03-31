import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import AdminCoursesPage from '@features/courses/pages/AdminCoursesPage';
import InstructorCourseDetailPage from '@features/instructor/pages/InstructorCourseDetailPage';
import InstructorTasksPage from '@features/instructor/pages/InstructorTasksPage';

import ProtectedRoute from '@features/auth/components/ProtectedRoute';
import LoginPage from '@features/auth/pages/LoginPage';
import RegisterForm from '@features/auth/components/RegisterForm';
import Dashboard from '@features/dashboard/pages/Dashboard';
import Profile from '@features/profile/Profile';
import StudentCourseEnrollmentPage from '@features/courses/pages/StudentCourseEnrollmentPage';
import EditCourse from '@features/courses/components/EditCourse';
import StudentTasksPage from '@features/learningTasks/pages/StudentTasksPage';
import TaskViewPage from '@features/learningTasks/pages/TaskViewPage';
import ProgressTrackingUI from '@features/dashboard/ProgressTrackingUI';
import InstructorViews from '@features/instructor/InstructorViews';
import InstructorCoursesPage from '@features/instructor/InstructorCoursesPage';
import CourseDetailsPage from '@features/courses/pages/CourseDetailsPage';
import AdminTasksPage from '@features/admin/pages/AdminTasksPage';
import StudentDashboard from '@features/dashboard/StudentDashboard';
import InstructorDashboard from '@features/dashboard/InstructorDashboard';
import AdminDashboard from '@features/dashboard/AdminDashboard';
import HomePage from '@features/home/pages/HomePage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
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
            <StudentCourseEnrollmentPage />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
