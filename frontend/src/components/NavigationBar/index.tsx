import React, {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
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
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import {menuConfig} from '@/config/menuConfig';
import {useAuth} from '@/context/auth/AuthContext';
import {TUserRole} from '@/context/auth/types';

/**
 * NavigationBar component for the application
 * Displays navigation links based on user role and logout button
 */
const NavigationBar: React.FC = () => {
  const {getUserRole, logout, user} = useAuth();
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
  const isActive = (path: string) => location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Drawer content for mobile view
  const drawerContent = (
    <Box sx={{width: 250}} role="presentation">
      <List>
        {filteredMenu.map((menu) => (
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
              }
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
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{mr: 2}}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{flexGrow: 1}}>
            LearnPlatform
            {user && (
              <Typography variant="caption" display="block">
                {user.display_name || user.username}
              </Typography>
            )}
          </Typography>

          {/* Desktop navigation */}
          {!isMobile && (
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
                      borderRadius: 0
                    })
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
                  sx={{ml: 2}}
                  size="small"
                />
              )}
              <Button
                color="inherit"
                component={Link}
                to="/logout"
                onClick={logout}
                sx={{ml: 2}}
                startIcon={<ExitToAppIcon />}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default NavigationBar;
