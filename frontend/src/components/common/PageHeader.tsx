import AddIcon from '@mui/icons-material/Add';
import { Box, Typography, Button } from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const PageHeader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
    }}
  >
    <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
      Manage Courses
    </Typography>

    <Button
      component={RouterLink}
      to="/instructor/courses/new"
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      size="medium"
      data-testid="create-course-button"
    >
      Create New Course
    </Button>
  </Box>
);

export default PageHeader;
