import React from 'react';
import { MenuItem, ListItemText } from '@mui/material';
import { useAuth } from '@features/auth/AuthContext'; // Update the path to the correct location
import { Link } from 'react-router-dom';
import { menuConfig } from '../config/menuConfig';

const MainMenu: React.FC = () => {
    const { user } = useAuth();
    const userRole = user?.role || localStorage.getItem('user_role') || 'guest'; // Add fallback to 'guest'

    return (
        <div>
            {menuConfig
                .filter(menu => menu.roles.includes(userRole))
                .map(menu => (
                    <MenuItem key={menu.text} component={Link} to={menu.path}>
                        <ListItemText primary={menu.text} />
                    </MenuItem>
                ))}
        </div>
    );
};

export default MainMenu;
