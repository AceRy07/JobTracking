import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, TeamMemberRow, TeamMemberInsert, TeamMemberUpdate } from './supabase';
import { Assignee } from '../types';

export type { TeamMemberRow, TeamMemberInsert, TeamMemberUpdate };

export async function getTeamMembers(): Promise<TeamMemberRow[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Ekip üyeleri alınırken hata oluştu:', error.message);
    throw error;
  }

  return data || [];
}

export async function addTeamMember(member: TeamMemberInsert): Promise<TeamMemberRow> {
  if (!isSupabaseConfigured) throw new Error('Supabase yapılandırması eksik.');

  const { data, error } = await supabase
    .from('team_members')
    .insert(member as any)
    .select()
    .single();

  if (error) {
    console.error('Ekip üyesi eklenirken hata oluştu:', error.message);
    throw error;
  }

  return data as TeamMemberRow;
}

export async function updateTeamMember(id: string, updates: TeamMemberUpdate): Promise<TeamMemberRow> {
  if (!isSupabaseConfigured) throw new Error('Supabase yapılandırması eksik.');

  const { data, error } = await supabase
    .from('team_members')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`ID: ${id} olan ekip üyesi güncellenirken hata oluştu:`, error.message);
    throw error;
  }

  return data as TeamMemberRow;
}

export async function deleteTeamMember(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase yapılandırması eksik.');

  const { error } = await supabase.from('team_members').delete().eq('id', id);

  if (error) {
    console.error(`ID: ${id} olan ekip üyesi silinirken hata oluştu:`, error.message);
    throw error;
  }
}

export function teamMemberRowToAssignee(row: TeamMemberRow): Assignee {
  const initials = row.initials || row.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  return {
    id: row.id,
    name: row.name,
    role: row.role || 'Üye',
    initials,
    avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    badgeBg: row.badge_bg || 'bg-indigo-100',
    badgeColor: row.badge_color || 'text-indigo-800'
  };
}

export function assigneeToTeamMemberInsert(assignee: Assignee): TeamMemberInsert {
  return {
    id: assignee.id,
    name: assignee.name,
    role: assignee.role || 'Üye',
    initials: assignee.initials || 'U',
    avatar_url: assignee.avatarUrl || null,
    badge_bg: assignee.badgeBg || 'bg-indigo-100',
    badge_color: assignee.badgeColor || 'text-indigo-800'
  };
}

export function subscribeToTeamMembers(handlers: {
  onInsert?: (row: TeamMemberRow) => void;
  onUpdate?: (row: TeamMemberRow) => void;
  onDelete?: (id: string) => void;
}): RealtimeChannel | null {
  if (!isSupabaseConfigured) return null;

  return supabase
    .channel('public:team_members')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_members' }, (payload) => {
      handlers.onInsert?.(payload.new as TeamMemberRow);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'team_members' }, (payload) => {
      handlers.onUpdate?.(payload.new as TeamMemberRow);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'team_members' }, (payload) => {
      handlers.onDelete?.((payload.old as TeamMemberRow).id);
    })
    .subscribe();
}
