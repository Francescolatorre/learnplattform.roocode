import {useParams} from 'react-router-dom';

import {ILearningTask} from '@/types/task';
import DataTable, {Column} from '@components/DataTable'; // Corrected import // Corrected import
import {useCourseTasks} from '@services/useCourseTasks';

const AdminTasksPage = () => {
  const {courseId} = useParams();
  const {data, isLoading, error} = useCourseTasks(courseId!);

  const columns: Column<ILearningTask>[] = [
    {id: 'id', label: 'ID', minWidth: 70},
    {id: 'title', label: 'Title', minWidth: 200},
    {id: 'description', label: 'Description', minWidth: 300},
  ];

  const keyExtractor = (item: ILearningTask) => {
    return item.id.toString();
  };

  return (
    <div>
      <h1>Admin Tasks Page</h1>
      {isLoading && <p>Loading tasks...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div style={{height: 400, width: '100%'}}>
          <DataTable columns={columns} data={data} keyExtractor={keyExtractor} />
        </div>
      )}
    </div>
  );
};

export default AdminTasksPage;
