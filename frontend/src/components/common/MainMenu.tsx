import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const MainMenu: React.FC = () => {
    return (
        <nav>
            <List>
                <ListItem button component={Link} to="/dashboard">
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component={Link} to="/courses">
                    <ListItemText primary="Courses" />
                </ListItem>
                <ListItem button component={Link} to="/profile">
                    <ListItemText primary="Profile" />
                </ListItem>
            </List>
        </nav>
    );
};

export default MainMenu;
