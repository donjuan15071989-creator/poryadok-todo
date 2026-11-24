export type TaskPriority = 'normal' | 'important' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate: string | null;
  priority: TaskPriority;
}

export type FilterType = 'all' | 'active' | 'completed';