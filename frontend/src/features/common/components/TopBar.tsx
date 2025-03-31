import React from 'react';
import {AppBar, Toolbar, Typography, Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';

const TopBar: React.FC = () => {
    const navigate = useNavigate();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{flexGrow: 1}}>
                    Learning Platform
                </Typography>
                <Button color="inherit" onClick={() => navigate('/login')}>
                    Login
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default TopBar;
