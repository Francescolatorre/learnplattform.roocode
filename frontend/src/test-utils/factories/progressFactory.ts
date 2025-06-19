import { Factory } from 'fishery';
import { IUserProgress, ICourseProgressSummary } from '@/types/progress';

export const userProgressFactory = Factory.define<IUserProgress>(({ sequence }) => ({
  id: sequence,
  percentage: Math.floor(Math.random() * 100),
  label: `Progress ${sequence}`,
}));

export const courseProgressSummaryFactory = Factory.define<ICourseProgressSummary>(
  ({ sequence }) => ({
    completedTasks: Math.floor(Math.random() * 10),
    totalTasks: 10,
    averageScore: Math.floor(Math.random() * 100),
  })
);
