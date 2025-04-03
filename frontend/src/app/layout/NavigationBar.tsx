import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import { menuConfig } from '../../config/menuConfig'; // Use relative path if alias is not configured

import { useAuth } from '@features/auth/context/AuthContext';

const NavigationBar: React.FC = () => {
  const { userRole, logout, isAuthenticated } = useAuth(); // Get the user's role and logout function from the AuthContext
  const navigate = useNavigate();

  const handleLogoff = async () => {
    try {
      await logout();
      console.log('User logged off successfully.');
    } catch (error) {
      console.error('Failed to log off:', error);
    }
  };

  const handleLogin = () => {
    // Logic to handle login (e.g., redirect to login page)
    console.log('Redirecting to login page...');
    navigate('/login'); // Use the navigate function from useNavigate hook
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Learning Platform
        </Typography>
        <Box>
          {menuConfig
            .filter(menuItem => menuItem.roles.includes(userRole)) // Filter items based on user role
            .map(menuItem => (
              <Button key={menuItem.path} color="inherit" component={Link} to={menuItem.path}>
                {menuItem.text}
              </Button>
            ))}

          {isAuthenticated && (
            <Button color="inherit" onClick={handleLogoff}>
              Logoff
            </Button>
          )}
          {!isAuthenticated && (
            <Button color="inherit" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
