import React, { useEffect, useState } from 'react';
import { fetchTasksByCourse } from '../services/taskService';
import { Task } from '../types/apiTypes';

interface TaskListProps {
  courseId: string;
}

const TaskList: React.FC<TaskListProps> = ({ courseId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTasksByCourse(courseId);
        setTasks(data.results);
      } catch (err: any) {
        setError(err.message || 'Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [courseId]);

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Task List</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title} - {task.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
