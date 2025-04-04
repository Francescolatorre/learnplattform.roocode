import apiService from '../../../services/api/apiService';
import { LearningTask } from '../../../types/common/entities';

const LearningTaskService =
  apiService.createResourceService<LearningTask>('/api/v1/learning-tasks');

export default LearningTaskService;
