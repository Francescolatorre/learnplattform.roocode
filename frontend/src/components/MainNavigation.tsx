import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../features/auth/AuthContext';


const MainNavigation: React.FC = () => {
    const user = useAuth().user;
    const userRole = user?.role || localStorage.getItem('user_role');

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    LearnPlatform
                </Typography>
                <Button color="inherit" component={Link} to="/dashboard">
                    Dashboard
                </Button>
                {userRole === 'instructor' && (
                    <Button color="inherit" component={Link} to="/instructor">
                        Instructor Views
                    </Button>
                )}
                <Button color="inherit" component={Link} to="/logout">
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default MainNavigation;
