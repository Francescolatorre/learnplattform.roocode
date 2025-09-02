import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const LoadingIndicator: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
    <CircularProgress />
  </Box>
);

export default LoadingIndicator;
