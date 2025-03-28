import React from 'react';
import {List, ListItem, ListItemText} from '@mui/material';

interface ITask {
    id: string;
    title: string;
    description: string;
}

interface ITaskListProps {
    tasks: ITask[];
}

const TaskList: React.FC<ITaskListProps> = ({tasks}) => {
    if (!tasks || tasks.length === 0) {
        return <div>No tasks to display.</div>;
    }

    return (
        <List>
            {tasks.map((task) => (
                <ListItem key={task.id}>
                    <ListItemText primary={task.title} secondary={task.description} />
                </ListItem>
            ))}
        </List>
    );
};

export default TaskList;
