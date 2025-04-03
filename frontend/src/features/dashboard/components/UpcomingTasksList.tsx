import React from 'react';

interface UpcomingTasksListProps {
    tasks: Array<{title: string; dueDate: string}>;
}

const UpcomingTasksList: React.FC<UpcomingTasksListProps> = ({tasks}) => {
    return (
        <div>
            <h3>Upcoming Tasks</h3>
            <ul>
                {tasks.map((task, index) => (
                    <li key={index}>
                        {task.title} - Due: {task.dueDate}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UpcomingTasksList;
