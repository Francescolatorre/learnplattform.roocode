import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { menuConfig } from '@/config/menuConfig';
import { useAuth } from '@/context/auth/AuthContext';
import { TUserRole } from '@/context/auth/types';

/**
 * Main NavigationBar component for the application
 * Displays navigation links based on user role and provides login/logout functionality
 */
const NavigationBar: React.FC = () => {
  const { user, getUserRole, logout, isAuthenticated } = useAuth();
  const userRole = getUserRole();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter menu based on user role
  const filteredMenu = menuConfig.filter(menu => menu.roles.includes(userRole as TUserRole));

  console.info('MainNavigation rendered');
  console.info('menuConfig:', menuConfig);
  console.info('userRole:', userRole);
  console.info('Filtered menu:', filteredMenu);

  // Check if a menu item is active
  const isActive = (path: string) => {
    // Special case for dashboard paths
    if (path.endsWith('/dashboard')) {
      return location.pathname.endsWith('/dashboard');
    }

    // Direct path match
    if (location.pathname === path) {
      return true;
    }

    // Match paths like /courses and /courses/123
    if (path !== '/' && location.pathname.startsWith(path)) {
      // Ensure we're not matching partial paths (e.g., /courses should not match /coursesdetail)
      const nextChar = location.pathname.charAt(path.length);
      return nextChar === '' || nextChar === '/';
    }

    return false;
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Drawer content for mobile view
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {filteredMenu.map(menu => (
          <ListItem
            button
            key={menu.text}
            component={Link}
            to={menu.path}
            onClick={() => setDrawerOpen(false)}
            sx={{
              backgroundColor: isActive(menu.path) ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            {menu.icon && (
              <ListItemIcon>
                <menu.icon />
              </ListItemIcon>
            )}
            <ListItemText primary={menu.text} />
          </ListItem>
        ))}
        {isAuthenticated && (
          <>
            <Divider />
            <ListItem
              button
              onClick={() => {
                logout();
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isAuthenticated && isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Learning Platform
            {user && (
              <Typography variant="caption" display="block">
                {user.display_name || user.username}
              </Typography>
            )}
          </Typography>

          {/* Desktop navigation */}
          {!isMobile && (
            <>
              {isAuthenticated ? (
                <>
                  {filteredMenu.map(menu => (
                    <Button
                      key={menu.text}
                      color="inherit"
                      component={Link}
                      to={menu.path}
                      sx={{
                        margin: '0 8px',
                        ...(isActive(menu.path) && {
                          borderBottom: '2px solid',
                          borderRadius: 0,
                        }),
                      }}
                      startIcon={menu.icon && <menu.icon />}
                    >
                      {menu.text}
                    </Button>
                  ))}

                  {userRole && (
                    <Chip
                      label={`Role: ${userRole}`}
                      color="secondary"
                      sx={{ ml: 2 }}
                      size="small"
                    />
                  )}

                  <Button
                    color="inherit"
                    onClick={logout}
                    sx={{ ml: 2 }}
                    startIcon={<ExitToAppIcon />}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/login">
                    Login
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/register"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  >
                    Register
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default NavigationBar;
