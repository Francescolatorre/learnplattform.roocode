import { Factory } from 'fishery';

import { ILearningTask } from '@/types/task';

export const learningTaskFactory = Factory.define<ILearningTask>(({ sequence }) => ({
  id: sequence,
  course: 1,
  title: `Sample Task ${sequence}`,
  description: 'Sample description',
  description_html: '<p>Sample description</p>',
  order: sequence,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_published: true,
}));
