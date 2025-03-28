import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LearningTaskService from '../../services/learningTaskService';
import { ILearningTask } from '../../types/learningTaskTypes';

const DetailedTaskViewPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<ILearningTask | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        setError('Task ID is missing.');
        return;
      }

      try {
        const fetchedTask = await LearningTaskService.fetchLearningTaskById(Number(taskId));
        setTask(fetchedTask);
      } catch (err) {
        console.error('Failed to fetch task:', err);
        setError('Failed to load the task.');
      }
    };

    fetchTask();
  }, [taskId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!task) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{task.title}</h1>
      <p>{task.description}</p>
      <p>
        <strong>Order:</strong> {task.order}
      </p>
      <p>
        <strong>Published:</strong> {task.is_published ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Created At:</strong> {new Date(task.created_at).toLocaleString()}
      </p>
      <p>
        <strong>Updated At:</strong> {new Date(task.updated_at).toLocaleString()}
      </p>
    </div>
  );
};

export default DetailedTaskViewPage;
