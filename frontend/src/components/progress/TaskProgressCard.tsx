import { TaskProgress } from '@/types/common/entities';

interface TaskProgressCardProps {
  progress: TaskProgress;
}

const TaskProgressCard: React.FC<TaskProgressCardProps> = ({ progress }) => {
  return (
    <div className="task-progress-card">
      <h3>{progress.task_details?.title}</h3>
      <p>Status: {progress.status}</p>
      <p>Time Spent: {progress.time_spent || 'N/A'}</p>
      <p>Completion Date: {progress.completion_date || 'N/A'}</p>
    </div>
  );
};

export default TaskProgressCard;
