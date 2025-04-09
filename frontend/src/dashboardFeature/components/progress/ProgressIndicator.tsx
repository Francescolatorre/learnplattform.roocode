import { Box, CircularProgress, Typography } from '@mui/material';
import React from 'react';

interface IProgressIndicatorProps {
  value: number; // Progress value (0-100)
  label?: string; // Optional label to display
}

const ProgressIndicator: React.FC<IProgressIndicatorProps> = ({ value, label }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', m: 2 }}>
      <CircularProgress variant="determinate" value={value} size={80} />
      <Typography variant="h6" sx={{ mt: 1 }}>
        {label || `${value}%`}
      </Typography>
    </Box>
  );
};

export default ProgressIndicator;
