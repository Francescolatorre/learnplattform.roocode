import React, { useEffect, useState } from 'react';
import LearningTaskService from '../../services/learningTaskService';

const LearningTaskList: React.FC = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await LearningTaskService.fetchLearningTasks();
        setTasks(response.results);
      } catch (error) {
        console.error('Failed to fetch learning tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div>
      <h1>Learning Tasks</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default LearningTaskList;
