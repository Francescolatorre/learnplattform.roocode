export interface CourseProgress {
  courseId: string;
  studentId: string;
  totalTasks: number;
  completedTasks: number;
  averageScore: number;
  totalObjectives: number;
  achievedObjectives: number;
  moduleProgress: ModuleProgress[];
  taskProgress: TaskProgress[];
  recentActivity: ActivityEntry[];
}

export interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  averageScore: number | null;
}

export interface TaskProgress {
  taskId: string;
  title: string;
  moduleId: string;
  taskType: string;
  status: 'pending' | 'completed' | 'graded';
  dueDate: string | null;
  submissionDate: string | null;
  score: number | null;
  maxScore: number;
  attempts: number;
  maxAttempts: number;
  timeSpent: number | null; // in seconds
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  activityType: 'submission' | 'grade_received' | 'task_started' | 'achievement_earned';
  taskId?: string;
  taskTitle?: string;
  moduleId?: string;
  score?: number;
  achievementId?: string;
  achievementTitle?: string;
}
