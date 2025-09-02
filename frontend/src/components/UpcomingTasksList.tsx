import React from 'react';

interface UpcomingTasksListProps {
  tasks: Array<{ title: string }>;
}

const UpcomingTasksList: React.FC<UpcomingTasksListProps> = ({ tasks }) => {
  return (
    <div>
      <h3>Upcoming Tasks</h3>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingTasksList;
