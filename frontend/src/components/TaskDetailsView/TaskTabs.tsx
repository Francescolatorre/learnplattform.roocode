import {Tabs, Tab} from '@mui/material';
import React from 'react';

interface TaskTabsProps {
    activeTab: number;
    onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const TaskTabs: React.FC<TaskTabsProps> = ({activeTab, onTabChange}) => {
    return (
        <Tabs value={activeTab} onChange={onTabChange} sx={{mb: 2}}>
            <Tab label="Sort by Due Date" />
            <Tab label="Sort by Status" />
            <Tab label="Sort by Score" />
        </Tabs>
    );
};

export default TaskTabs;
