import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseTasks } from '@hooks/useCourseTasks';
import DataTable, { Column } from '@components/core/DataTable'; // Corrected import // Corrected import
import { LearningTask } from 'types/common/entities';

const AdminTasksPage = () => {
  const { courseId } = useParams();
  const { tasks, isLoading, error } = useCourseTasks(courseId!);
  const [learningTasks, setLearningTasks] = useState<LearningTask[]>([]);

  useEffect(() => {
    if (tasks) {
      setLearningTasks(tasks);
    }
  }, [tasks]);

  const columns: Column<LearningTask>[] = [
    { id: 'id', label: 'ID', minWidth: 70 },
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'description', label: 'Description', minWidth: 300 },
  ];

  const keyExtractor = (item: LearningTask) => {
    return item.id.toString();
  };

  return (
    <div>
      <h1>Admin Tasks Page</h1>
      {isLoading && <p>Loading tasks...</p>}
      {error && <p>Error: {error.message}</p>}
      {learningTasks && (
        <div style={{ height: 400, width: '100%' }}>
          <DataTable columns={columns} data={learningTasks} keyExtractor={keyExtractor} /> // Pass
          props // Pass props
        </div>
      )}
    </div>
  );
};

export default AdminTasksPage;
