import React from 'react';
import { Route, Routes } from 'react-router-dom';
import InstructorViews from './features/instructor/InstructorViews';
import EditCourse from './features/courses/EditCourse';
import AdminCoursesPage from './features/admin/AdminCoursesPage'; // Import AdminCoursesPage

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* ...existing routes... */}
            <Route path="/instructor" element={<InstructorViews />} />
            <Route path="/instructor/courses/:courseId/edit" element={<EditCourse />} />
            <Route path="/admin/courses/:courseId/edit" element={<EditCourse />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} /> {/* Add this route */}
            {/* ...existing routes... */}
        </Routes>
    );
};

export default AppRoutes;
