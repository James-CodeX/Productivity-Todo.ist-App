export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  recurringSchedule?: "daily" | "weekly" | "monthly" | null;
  lastCompletedAt?: string;
  nextDueAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompletionHistory {
  id: string;
  taskId: string;
  completedAt: string;
}
