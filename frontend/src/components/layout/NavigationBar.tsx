import React from 'react';
import {AppBar, Toolbar, Typography, Button} from '@mui/material';
import {Link} from 'react-router-dom';
import {useAuth} from '../../features/auth/context/AuthContext';
import StatusChip from '@components/core/StatusChip';

const NavigationBar: React.FC = () => {
  const {userRole, logout, isAuthenticated, getAccessToken} = useAuth();

  const handleLogout = async () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      await logout(accessToken);
      console.log('User logged out');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{flexGrow: 1}}>
          Learning Platform
        </Typography>
        {isAuthenticated && (
          <div>
            {userRole && (
              <StatusChip status="success" label={userRole} />
            )}
          </div>
        )}
        <Button color="inherit" component={Link} to="/profile">
          Profile
        </Button>
        <Button color="inherit" component={Link} to="/courses">
          Courses
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
