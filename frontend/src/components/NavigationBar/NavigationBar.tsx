import { AppBar, Toolbar, Typography, Button, Chip } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import { menuConfig } from '../../config/menuConfig';
import { useAuth } from '../../features/auth/context/AuthContext';
const NavigationBar: React.FC = () => {
  const { user, getUserRole, logout } = useAuth();
  const userRole = getUserRole();

  console.log('MainNavigation rendered');
  console.log('menuConfig:', menuConfig);
  console.log('userRole:', userRole);
  console.log(
    'Filtered menu:',
    menuConfig.filter(menu => menu.roles.includes(userRole))
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          LearnPlatform
        </Typography>
        {menuConfig
          .filter(menu => menu.roles.includes(userRole))
          .map(menu => {
            if (menu.text === 'Student Courses' && userRole !== 'student') {
              return null;
            }
            return (
              <Button
                key={menu.text}
                color="inherit"
                component={Link}
                to={menu.path}
                sx={{ margin: '0 8px' }}
              >
                {menu.text}
              </Button>
            );
          })}
        {userRole && <Chip label={`Role: ${userRole}`} color="secondary" sx={{ ml: 2 }} />}
        <Button color="inherit" component={Link} to="/logout" onClick={logout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};
export default NavigationBar;
