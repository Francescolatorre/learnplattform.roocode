import { Factory } from 'fishery';
import { ILearningTask } from '@/types/task';

export const learningTaskFactory = Factory.define<ILearningTask>(({ sequence }) => ({
  id: `task-${sequence}`,
  course: 1,
  course_id: 'course-1',
  title: `Sample Task ${sequence}`,
  description: 'Sample description',
  order: sequence,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_published: true,
  status: 'published',
}));
