import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { menuConfig } from '../../config/menuConfig'; // Use relative path if alias is not configured

const NavigationBar: React.FC = () => {
    const { userRole, logout } = useAuth(); // Get the user's role and logout function from the AuthContext

    const handleLogoff = async () => {
        try {
            await logout();
            console.log('User logged off successfully.');
        } catch (error) {
            console.error('Failed to log off:', error);
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Learning Platform
                </Typography>
                <Box>
                    {menuConfig
                        .filter((menuItem) => menuItem.roles.includes(userRole)) // Filter items based on user role
                        .map((menuItem) => (
                            <Button
                                key={menuItem.path}
                                color="inherit"
                                component={Link}
                                to={menuItem.path}
                            >
                                {menuItem.text}
                            </Button>
                        ))}
                    <Button color="inherit" onClick={handleLogoff}>
                        Logoff
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default NavigationBar;
