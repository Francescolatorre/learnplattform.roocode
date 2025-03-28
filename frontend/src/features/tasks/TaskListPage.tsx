import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, Typography } from '@mui/material';
import { fetchLearningTasks } from '../../services/learningTaskService';

interface ILearningTask {
    id: string;
    title: string;
}

const TaskListPage: React.FC = () => {
    const [learningTasks, setLearningTasks] = useState<ILearningTask[]>([]);

    useEffect(() => {
        const loadTasks = async () => {
            const tasks = await fetchLearningTasks();
            setLearningTasks(tasks);
        };
        loadTasks();
    }, []);

    return (
        <div>
            <Typography variant="h4">Learning Tasks</Typography>
            <List>
                {learningTasks.map((task) => (
                    <ListItem key={task.id}>
                        <Link to={`/learning-tasks/${task.id}`}>
                            <Typography>{task.title}</Typography>
                        </Link>
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default TaskListPage;
