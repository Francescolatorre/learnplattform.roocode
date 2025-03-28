import React, { useEffect } from 'react';
import { useApiResource } from '@hooks/useApiResource';

const StudentTasksPage = () => {
  const { data: tasksData } = useApiResource('/api/v1/learning-tasks', { page: 1 });

  useEffect(() => {
    // Log data only once
    console.log('Tasks data fetched:', tasksData);
  }, [tasksData]);

  return <div>{/* Render tasks */}</div>;
};

export default StudentTasksPage;
