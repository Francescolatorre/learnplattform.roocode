import React, { useEffect, useState } from 'react';
import LearningTaskService from '../services/learningTaskService';
import { ILearningTask } from '../types/learningTaskTypes'; // Import shared interface

interface LearningTaskListProps {
  limit?: number; // Optional limit for the number of tasks to display
}

const LearningTaskList: React.FC<LearningTaskListProps> = ({ limit }) => {
  const [tasks, setTasks] = useState<ILearningTask[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await LearningTaskService.fetchLearningTasks();
        const limitedTasks = limit ? response.results.slice(0, limit) : response.results;
        setTasks(limitedTasks);
      } catch (error) {
        console.error('Failed to fetch learning tasks:', error);
      }
    };

    fetchTasks();
  }, [limit]);

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
