import React from 'react';
import {Link} from 'react-router-dom';
import {AppBar, Toolbar, Typography, Button, Chip} from '@mui/material';

import {useAuth} from '@context/auth/AuthContext';
import {menuConfig} from '@config/menuConfig';
const NavigationBar: React.FC = () => {
  const {getUserRole, logout} = useAuth();
  const userRole = getUserRole();

  console.info('MainNavigation rendered');
  console.info('menuConfig:', menuConfig);
  console.info('userRole:', userRole);
  console.info(
    'Filtered menu:',
    menuConfig.filter(menu => menu.roles.includes(userRole))
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{flexGrow: 1}}>
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
                sx={{margin: '0 8px'}}
              >
                {menu.text}
              </Button>
            );
          })}
        {userRole && <Chip label={`Role: ${userRole}`} color="secondary" sx={{ml: 2}} />}
        <Button color="inherit" component={Link} to="/logout" onClick={logout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};
export default NavigationBar;
