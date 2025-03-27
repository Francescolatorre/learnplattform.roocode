import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@pages/HomePage';
import CoursesPage from '@pages/CoursesPage';
import CourseDetailPage from '@pages/CourseDetailPage';
import StudentTasksPage from '@pages/StudentTasksPage';
import EditCoursePage from '@pages/EditCoursePage';
import RoleBasedRoute from '@components/common/RoleBasedRoute';
import ProtectedRoute from '@components/common/ProtectedRoute';
import CourseDetailsPage from '@pages/CourseDetailsPage';

const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                <Route path="/courses/:courseId/tasks" element={<StudentTasksPage />} />
                <Route
                    path="/courses/:courseId/edit"
                    element={
                        <RoleBasedRoute allowedRoles={['instructor']}>
                            <EditCoursePage />
                        </RoleBasedRoute>
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
            </Routes>
        </Router>
    );
};

export default AppRoutes;
