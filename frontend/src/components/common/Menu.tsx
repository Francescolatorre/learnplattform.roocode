import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Menu, MenuItem, Button} from '@mui/material';

import {useAuth} from '@features/auth/context/AuthContext'; // Custom hook to get auth state

const AppMenu: React.FC = () => {
  const {user, logout} = useAuth(); // Get user and logout function from auth context
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Button onClick={handleMenuOpen} color="inherit">
        Menu
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {user ? (
          <>
            {user.role === 'student' && (
              <MenuItem onClick={() => navigate('/dashboard/student')}>Student Dashboard</MenuItem>
            )}
            {user.role === 'instructor' && (
              <MenuItem onClick={() => navigate('/dashboard/instructor')}>
                Instructor Dashboard
              </MenuItem>
            )}
            {user.role === 'admin' && (
              <MenuItem onClick={() => navigate('/dashboard/admin')}>Admin Dashboard</MenuItem>
            )}
            <MenuItem onClick={handleLogout}>Logoff</MenuItem>
          </>
        ) : (
          <MenuItem onClick={() => navigate('/login')}>Login</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default AppMenu;
