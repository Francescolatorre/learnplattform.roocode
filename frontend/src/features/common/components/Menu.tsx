import React from 'react';
import {Menu as MuiMenu, MenuItem} from '@mui/material';

interface MenuProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    options: string[];
    onSelect: (option: string) => void;
}

const Menu: React.FC<MenuProps> = ({anchorEl, open, onClose, options, onSelect}) => {
    return (
        <MuiMenu anchorEl={anchorEl} open={open} onClose={onClose}>
            {options.map((option, index) => (
                <MenuItem key={index} onClick={() => onSelect(option)}>
                    {option}
                </MenuItem>
            ))}
        </MuiMenu>
    );
};

export default Menu;
