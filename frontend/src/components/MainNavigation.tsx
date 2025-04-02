import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Chip } from '@mui/material';

import { useAuth } from '../features/auth/context/AuthContext';
import { menuConfig } from '../config/menuConfig';

const MainNavigation: React.FC = () => {
  const user = useAuth().user;
  const userRole = user?.role || localStorage.getItem('user_role') || 'guest'; // Add fallback to 'guest'

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
          .map(menu => (
            <Button
              key={menu.text}
              color="inherit"
              component={Link}
              to={menu.path}
              sx={{ margin: '0 8px', border: '1px solid red', backgroundColor: 'yellow' }} // Temporary styling
            >
              {menu.text}
            </Button>
          ))}
        {userRole && <Chip label={`Role: ${userRole}`} color="secondary" sx={{ ml: 2 }} />}
        <Button color="inherit" component={Link} to="/logout">
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default MainNavigation;
