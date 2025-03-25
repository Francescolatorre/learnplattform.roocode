import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { fetchInstructorDashboardData, fetchStudentProgressByUser } from '../../services/progressService';
import { fetchAdminDashboardSummary } from '../../services/courseService';
import withAuth from '../auth/withAuth';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const userRole = user?.role || 'Not assigned';
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          if (userRole === 'student') {
            /* no data here */
          } else if (userRole === 'instructor') {
            const instructorData = await fetchInstructorDashboardData();
            setData(instructorData);
          } else if (userRole === 'admin') {
            const adminData = await fetchAdminDashboardSummary();
            setData(adminData);
          }
          setError(null);
        } catch (error: any) {
          setError(error.message || 'Failed to load dashboard data.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [isAuthenticated, user, userRole]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (userRole === 'student') {
    return <StudentDashboard data={data} />;
  } else if (userRole === 'instructor') {
    return <InstructorDashboard data={data} />;
  } else if (userRole === 'admin') {
    return <AdminDashboard data={data} />;
  } else {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">You do not have access to this dashboard.</Alert>
      </Box>
    );
  }
};

export default withAuth(Dashboard, { allowedRoles: ['student', 'instructor', 'admin'] });
