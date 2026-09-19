import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, TaskRow, TaskInsert, TaskUpdate } from './supabase';
import { Assignee, Task, getTaskAssignees } from '../types';

export type { TaskRow, TaskInsert, TaskUpdate };

function createFallbackAssignee(id?: string): Assignee {
  const safeId = id && id.trim() ? id : 'unassigned';
  const initials = safeId
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  return {
    id: safeId,
    name: safeId === 'unassigned' ? 'Atanmış Kişi' : safeId,
    role: 'Ekip Üyesi',
    initials,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  };
}

/**
 * Tüm görevleri veritabanından getirir (en son oluşturulana göre azalan sırada).
 */
export async function getTasks(): Promise<TaskRow[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Görevler alınırken hata oluştu:', error.message);
    throw error;
  }

  return data || [];
}

export async function addTask(task: TaskInsert): Promise<TaskRow> {
  if (!isSupabaseConfigured) throw new Error('Supabase yapılandırması eksik.');

  const { data, error } = await supabase
    .from('tasks')
    .insert(task as any)
    .select()
    .single();

  if (error) {
    console.error('Görev eklenirken hata oluştu:', error.message);
    throw error;
  }

  return data as TaskRow;
}

export async function updateTask(id: string, updates: TaskUpdate): Promise<TaskRow> {
  if (!isSupabaseConfigured) throw new Error('Supabase yapılandırması eksik.');

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`ID: ${id} olan görev güncellenirken hata oluştu:`, error.message);
    throw error;
  }

  return data as TaskRow;
}

export async function deleteTask(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase yapılandırması eksik.');

  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) {
    console.error(`ID: ${id} olan görev silinirken hata oluştu:`, error.message);
    throw error;
  }
}

/**
 * Supabase görev satırını UI Task nesnesine dönüştürür.
 */
export function taskRowToTask(row: TaskRow): Task {
  const assignees = (row.assignee_ids || []).map((id) => createFallbackAssignee(id));
  const resolvedAssignees = assignees.length > 0 ? assignees : [createFallbackAssignee('unassigned')];

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    details: row.details || '',
    project: row.project,
    startDate: row.start_date || '',
    dueDate: row.due_date || '',
    dueStatusNote: row.due_status_note || undefined,
    status: row.status,
    assignees: resolvedAssignees,
    assignee: resolvedAssignees[0],
    priority: row.priority || undefined,
    commentsCount: row.comments_count ?? undefined,
    filesCount: row.files_count ?? undefined,
    figmaLink: row.figma_link || undefined,
    category: row.category || undefined,
    completed: row.completed,
    createdAt: row.created_at
  };
}

/**
 * UI Task nesnesini Supabase kayıt formatına dönüştürür.
 */
export function taskToTaskInsert(task: Omit<Task, 'id' | 'createdAt'> | Task): TaskInsert {
  return {
    code: task.code,
    title: task.title,
    details: task.details ?? null,
    project: task.project,
    start_date: task.startDate ?? null,
    due_date: task.dueDate ?? null,
    due_status_note: task.dueStatusNote ?? null,
    status: task.status,
    assignee_ids: getTaskAssignees(task as Task).map((a) => a.id),
    priority: task.priority ?? null,
    comments_count: task.commentsCount ?? null,
    files_count: task.filesCount ?? null,
    figma_link: task.figmaLink ?? null,
    category: task.category ?? null,
    completed: task.completed
  };
}

/**
 * "tasks" tablosundaki değişiklikleri anlık olarak dinler (cihazlar arası senkronizasyon).
 */
export function subscribeToTasks(handlers: {
  onInsert?: (row: TaskRow) => void;
  onUpdate?: (row: TaskRow) => void;
  onDelete?: (id: string) => void;
}): RealtimeChannel | null {
  if (!isSupabaseConfigured) return null;

  return supabase
    .channel('public:tasks')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, (payload) => {
      handlers.onInsert?.(payload.new as TaskRow);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, (payload) => {
      handlers.onUpdate?.(payload.new as TaskRow);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, (payload) => {
      handlers.onDelete?.((payload.old as TaskRow).id);
    })
    .subscribe();
}
