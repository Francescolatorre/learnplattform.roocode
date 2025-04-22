import {TCompletionStatus} from './entities';
import {ITaskProgress} from './task';

/**
 * Interface representing a student's progress through a module
 */
export interface IModuleProgress {
  id: number;
  userId: number;
  moduleId: number;
  completionStatus: TCompletionStatus;
  completionPercentage: number;
  tasksCompleted: number;
  totalTasks: number;
  lastAccessedAt?: string;
  taskProgress?: ITaskProgress[];
}

/**
 * Basic module data structure
 */
export interface IModuleData {
  id: number;
  title: string;
  description: string;
  order: number;
  courseId: number;
}
