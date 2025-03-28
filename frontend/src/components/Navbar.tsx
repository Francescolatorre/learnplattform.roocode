import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const NavigationLinks: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6">Navigation</Typography>
      <Link to="/courses/enroll">Enroll in Courses</Link>
    </Box>
  );
};

export default NavigationLinks;
