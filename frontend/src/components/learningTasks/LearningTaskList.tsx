import { LearningTask } from '@/types/common/entities';

interface LearningTaskListProps {
  tasks: LearningTask[];
}

const LearningTaskList: React.FC<LearningTaskListProps> = ({ tasks }) => {
  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </div>
      ))}
    </div>
  );
};

export default LearningTaskList;
