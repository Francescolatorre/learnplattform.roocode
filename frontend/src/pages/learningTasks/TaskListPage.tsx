import { List, ListItem, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ILearningTask } from '@/types/Task';
import { fetchCourseTasks } from 'src/services/resources/learningTaskService';

const TaskListPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [learningTasks, setLearningTasks] = useState<ILearningTask[]>([]);

  useEffect(() => {
    if (!courseId) return; // Defensive guard
    const loadTasks = async () => {
      const tasks = await fetchCourseTasks(courseId!);
      setLearningTasks(tasks);
    };
    loadTasks();
  }, [courseId]);

  return (
    <div>
      <Typography variant="h4">Learning Tasks</Typography>
      <List>
        {learningTasks.map(task => (
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
