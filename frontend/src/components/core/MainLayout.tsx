import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/context/AuthContext';
import { menuConfig } from '../../config/menuConfig';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { logout, user, getUserRole } = useAuth();
  const userRole = getUserRole();

  useEffect(() => {
    console.log('MainLayout rendered');
    console.log('menuConfig:', menuConfig);
    console.log('userRole:', userRole);
    console.log(
      'Filtered menu:',
      menuConfig.filter(menu => menu.roles.includes(userRole))
    );
  }, [userRole]); // Log only when userRole changes

  const handleNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    if (isMobile) setDrawerOpen(false);
    navigate(path);
  };

  const drawerContent = (
    <Box sx={{ width: 250 }}>
      <List>
        {menuConfig
          .filter(menu => menu.roles.includes(userRole))
          .map(menu => (
            <ListItemButton
              key={menu.text}
              onClick={() => handleNavigation(menu.path)}
              sx={{ padding: '10px 16px', '&:hover': { backgroundColor: '#f0f0f0' } }}
            >
              <ListItemIcon>{/* Add icons if needed */}</ListItemIcon>
              <ListItemText primary={menu.text} sx={{ fontSize: '1rem', color: '#333' }} />
            </ListItemButton>
          ))}
        <ListItemButton onClick={logout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Learning Platform
          </Typography>
          {userRole && (
            <Chip
              label={`Role: ${userRole}`}
              color="secondary"
              sx={{ ml: 2, display: { xs: 'none', sm: 'flex' } }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: 250 },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: 250, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { sm: 30 },
          mt: { xs: 8, sm: 8 }, // Add top margin to account for AppBar height
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export { MainLayout };
export default MainLayout;
