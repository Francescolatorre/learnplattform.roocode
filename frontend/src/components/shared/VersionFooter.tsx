import { Box, Typography } from '@mui/material';
import React from 'react';

const VersionFooter: React.FC = () => {
  const formatBuildTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 1,
        px: 2,
        textAlign: 'center',
        backgroundColor: 'grey.100',
        borderTop: '1px solid',
        borderColor: 'grey.300',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Version: {__COMMIT_HASH__} • Built: {formatBuildTime(__BUILD_TIME__)}
      </Typography>
    </Box>
  );
};

export default VersionFooter;