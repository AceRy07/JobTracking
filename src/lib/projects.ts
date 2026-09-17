import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, ProjectRow, ProjectInsert, ProjectUpdate } from './supabase';
import { Project } from '../types';

export type { ProjectRow, ProjectInsert, ProjectUpdate };

/**
 * Tüm projeleri veritabanından getirir.
 */
export async function getProjects(): Promise<ProjectRow[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Projeler alınırken hata oluştu:', error.message);
    throw error;
  }

  return data || [];
}

export async function addProject(project: ProjectInsert): Promise<ProjectRow> {
  if (!isSupabaseConfigured) throw new Error('Supabase yapılandırması eksik.');

  const { data, error } = await supabase
    .from('projects')
    .insert(project as any)
    .select()
    .single();

  if (error) {
    console.error('Proje eklenirken hata oluştu:', error.message);
    throw error;
  }

  return data as ProjectRow;
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<ProjectRow> {
  if (!isSupabaseConfigured) throw new Error('Supabase yapılandırması eksik.');

  const { data, error } = await supabase
    .from('projects')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`ID: ${id} olan proje güncellenirken hata oluştu:`, error.message);
    throw error;
  }

  return data as ProjectRow;
}

export async function deleteProject(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase yapılandırması eksik.');

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    console.error(`ID: ${id} olan proje silinirken hata oluştu:`, error.message);
    throw error;
  }
}

export function projectRowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    description: row.description || undefined
  };
}

export function projectToProjectInsert(project: Omit<Project, 'id'> | Project): ProjectInsert {
  return {
    name: project.name,
    color: project.color,
    description: project.description ?? null
  };
}

/**
 * "projects" tablosundaki değişiklikleri anlık olarak dinler (cihazlar arası senkronizasyon).
 */
export function subscribeToProjects(handlers: {
  onInsert?: (row: ProjectRow) => void;
  onUpdate?: (row: ProjectRow) => void;
  onDelete?: (id: string) => void;
}): RealtimeChannel | null {
  if (!isSupabaseConfigured) return null;

  return supabase
    .channel('public:projects')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, (payload) => {
      handlers.onInsert?.(payload.new as ProjectRow);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' }, (payload) => {
      handlers.onUpdate?.(payload.new as ProjectRow);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'projects' }, (payload) => {
      handlers.onDelete?.((payload.old as ProjectRow).id);
    })
    .subscribe();
}
