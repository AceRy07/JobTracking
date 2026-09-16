export type TaskStatus = 'Aktif' | 'Bitti' | 'Beklemede' | 'Kritik';
export type TaskPriority = 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';

export type ActiveView = 'tablo' | 'pano' | 'cizelge' | 'takvim';

export interface Assignee {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarUrl: string;
  badgeBg?: string;
  badgeColor?: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  details: string;
  project: string;
  startDate: string;
  dueDate: string;
  dueStatusNote?: string;
  status: TaskStatus;
  assignees: Assignee[];
  assignee?: Assignee; // Optional fallback for legacy items
  priority?: TaskPriority;
  commentsCount?: number;
  filesCount?: number;
  figmaLink?: string;
  category?: string;
  completed: boolean;
  createdAt: string;
}

export function getTaskAssignees(task: Task): Assignee[] {
  if (task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0) {
    return task.assignees;
  }
  if (task.assignee) {
    return [task.assignee];
  }
  return [];
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  company_name: string;
  position: string;
  status: ApplicationStatus;
  applied_date: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}
