import React from 'react';
import {AppBar, Toolbar, Typography, Button} from '@mui/material';
import {Link} from 'react-router-dom';
import {useAuth} from '../../features/auth/context/AuthContext';

const NavigationBar: React.FC = () => {
  const {userRole, logout, isAuthenticated} = useAuth();

  const handleLogout = async () => {
    await logout();
    console.log('User logged out');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{flexGrow: 1}}>
          Learning Platform
        </Typography>
        <Button color="inherit" component={Link} to="/dashboard">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/courses">
          Courses
        </Button>
        {userRole === 'student' && (
          <Button color="inherit" component={Link} to="/tasks">
            Tasks
          </Button>
        )}
        {userRole === 'admin' && (
          <Button color="inherit" component={Link} to="/admin">
            Admin
          </Button>
        )}
        <Button color="inherit" component={Link} to="/profile">
          Profile
        </Button>
        {isAuthenticated && (
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        )}

      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
