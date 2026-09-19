import { 
  supabase, 
  isSupabaseConfigured, 
  ApplicationRow, 
  ApplicationInsert, 
  ApplicationUpdate, 
  ApplicationStatus 
} from './supabase';
import { Assignee, Task, TaskStatus } from '../types';

export type { ApplicationRow, ApplicationInsert, ApplicationUpdate, ApplicationStatus };

function createFallbackAssignee(): Assignee {
  return {
    id: 'unassigned',
    name: 'Atanmış Kişi',
    role: 'Ekip Üyesi',
    initials: 'AK',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  };
}

/**
 * Tüm başvuruları veritabanından getirir (en son başvuru tarihine göre azalan sırada).
 */
export async function getApplications(): Promise<ApplicationRow[]> {
  if (!isSupabaseConfigured) {
    console.warn(
      'Supabase henüz yapılandırılmadı. Lütfen .env dosyasındaki VITE_SUPABASE_PUBLISHABLE_KEY değerini güncelleyin.'
    );
    return [];
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('applied_date', { ascending: false });

  if (error) {
    console.error('Başvurular alınırken hata oluştu:', error.message);
    throw error;
  }

  return data || [];
}

/**
 * Yeni bir başvuru kaydı ekler.
 */
export async function addApplication(application: ApplicationInsert): Promise<ApplicationRow> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase henüz yapılandırılmadı.');
    throw new Error('Supabase yapılandırması eksik.');
  }

  const { data, error } = await supabase
    .from('applications')
    .insert(application as any)
    .select()
    .single();

  if (error) {
    console.error('Başvuru eklenirken hata oluştu:', error.message);
    throw error;
  }

  return data as ApplicationRow;
}

/**
 * Mevcut bir başvuruyu ID üzerinden günceller.
 */
export async function updateApplication(
  id: string,
  updates: ApplicationUpdate
): Promise<ApplicationRow> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase henüz yapılandırılmadı.');
    throw new Error('Supabase yapılandırması eksik.');
  }

  const { data, error } = await supabase
    .from('applications')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`ID: ${id} olan başvuru güncellenirken hata oluştu:`, error.message);
    throw error;
  }

  return data as ApplicationRow;
}

/**
 * ID'ye göre başvuru kaydını siler.
 */
export async function deleteApplication(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase henüz yapılandırılmadı.');
    throw new Error('Supabase yapılandırması eksik.');
  }

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`ID: ${id} olan başvuru silinirken hata oluştu:`, error.message);
    throw error;
  }
}

/**
 * Supabase ApplicationStatus değerini UI TaskStatus değerine çevirir.
 */
export function mapAppStatusToTaskStatus(status: ApplicationStatus): TaskStatus {
  switch (status) {
    case 'applied':
      return 'Beklemede';
    case 'interview':
      return 'Kritik';
    case 'offer':
      return 'Bitti';
    case 'rejected':
      return 'Bitti';
    case 'withdrawn':
      return 'Beklemede';
    default:
      return 'Aktif';
  }
}

/**
 * UI TaskStatus değerini Supabase ApplicationStatus değerine çevirir.
 */
export function mapTaskStatusToAppStatus(status: TaskStatus, completed?: boolean): ApplicationStatus {
  if (completed || status === 'Bitti') return 'offer';
  if (status === 'Kritik') return 'interview';
  if (status === 'Beklemede') return 'applied';
  return 'applied';
}

/**
 * Supabase Application satırını mevcut UI Task nesnesine dönüştürür.
 */
export function applicationToTask(app: ApplicationRow): Task {
  const isCompleted = app.status === 'offer' || app.status === 'rejected';
  
  const statusLabels: Record<ApplicationStatus, string> = {
    applied: 'Başvuruldu',
    interview: 'Mülakat Aşamasında',
    offer: 'Teklif Alındı',
    rejected: 'Reddedildi',
    withdrawn: 'Geri Çekildi'
  };

  const fallbackAssignee = createFallbackAssignee();

  return {
    id: app.id,
    code: `APP-${app.id.slice(0, 4).toUpperCase()}`,
    title: `${app.company_name} - ${app.position}`,
    details: app.notes || `${app.company_name} için ${app.position} pozisyonuna başvuru yapıldı.`,
    project: app.company_name,
    startDate: app.applied_date,
    dueDate: app.applied_date,
    dueStatusNote: statusLabels[app.status] || 'Başvuruldu',
    status: mapAppStatusToTaskStatus(app.status),
    assignees: [fallbackAssignee],
    assignee: fallbackAssignee,
    priority: app.status === 'interview' ? 'Kritik' : app.status === 'offer' ? 'Yüksek' : 'Orta',
    completed: isCompleted,
    createdAt: app.created_at || new Date().toISOString(),
    category: 'İş Başvurusu'
  };
}
