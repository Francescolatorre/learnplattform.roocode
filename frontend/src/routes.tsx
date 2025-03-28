import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InstructorViews from './features/instructor/InstructorViews';
import EditCourse from './features/courses/EditCourse';
import AdminCoursesPage from './features/admin/AdminCoursesPage';
import TaskListPage from '@features/tasks/TaskListPage';

const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/instructor" element={<InstructorViews />} />
                <Route path="/instructor/courses/:courseId/edit" element={<EditCourse />} />
                <Route path="/admin/courses/:courseId/edit" element={<EditCourse />} />
                <Route path="/admin/courses" element={<AdminCoursesPage />} />
                <Route path="/tasks" element={<TaskListPage />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
