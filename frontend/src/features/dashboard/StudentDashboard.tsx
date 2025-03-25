import React from 'react';
import { Typography } from '@mui/material'; // Added import
import DashboardLayout from './DashboardLayout';

const StudentDashboard: React.FC<{ data: any }> = ({ data }) => {
    return (
        <DashboardLayout title="Student Dashboard">
            {/* Render student-specific data */}
            <div>
                <Typography variant="body1">Progress data will go here.</Typography>
                {/* Render progress data */}
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
