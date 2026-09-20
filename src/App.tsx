import React, { useState, useEffect, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  Sidebar 
} from './components/Sidebar';
import { 
  StatsCards 
} from './components/StatsCards';
import { 
  ControlBar 
} from './components/ControlBar';
import { 
  TaskTableView 
} from './components/TaskTableView';
import { 
  TaskKanbanView 
} from './components/TaskKanbanView';
import { 
  TaskTimelineView 
} from './components/TaskTimelineView';
import { 
  TaskCalendarView 
} from './components/TaskCalendarView';
import { 
  MobileTaskView 
} from './components/MobileTaskView';
import { 
  BottomNav 
} from './components/BottomNav';
import { 
  ProductivityWidgets 
} from './components/ProductivityWidgets';
import { 
  NewTaskModal 
} from './components/NewTaskModal';
import { 
  TaskDetailModal 
} from './components/TaskDetailModal';
import { 
  EditTaskModal 
} from './components/EditTaskModal';
import { 
  WorkspaceSettingsModal 
} from './components/WorkspaceSettingsModal';
import { 
  ReportsModal 
} from './components/ReportsModal';
import { 
  ShortcutsModal 
} from './components/ShortcutsModal';
import { 
  NewProjectModal 
} from './components/NewProjectModal';
import { 
  DeleteProjectModal 
} from './components/DeleteProjectModal';

import { ActiveView, Assignee, Project, Task, TaskStatus, getTaskAssignees } from './types';
import { CheckCircle, AlertCircle, Info, Pencil, Trash2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  taskRowToTask,
  taskToTaskInsert,
  subscribeToTasks
} from './lib/tasks';
import {
  getProjects,
  addProject,
  deleteProject,
  projectRowToProject,
  projectToProjectInsert,
  subscribeToProjects
} from './lib/projects';
import {
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  assigneeToTeamMemberInsert,
  teamMemberRowToAssignee,
  subscribeToTeamMembers
} from './lib/teamMembers';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { isDateInRange } from './utils/dateUtils';

const WORKSPACE_NAME = 'The West Wing';

const MobileTeamMemberRow: React.FC<{
  member: Assignee;
  onUpdate: (memberId: string, name: string, role: string) => void;
  onDelete: (memberId: string) => void;
}> = ({ member, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);

  if (isEditing) {
    return (
      <form
        className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-2.5 py-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          onUpdate(member.id, name, role);
          setIsEditing(false);
        }}
      >
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <input value={name} onChange={(event) => setName(event.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500" aria-label="Ekip üyesi adı" />
          <input value={role} onChange={(event) => setRole(event.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500" aria-label="Ekip üyesi rolü" />
        </div>
        <button type="submit" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Kaydet">
          <CheckCircle className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => setIsEditing(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg" title="Vazgeç">
          <X className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-2.5 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <img src={member.avatarUrl} alt={member.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gray-900 truncate">{member.name}</div>
          <div className="text-[11px] text-gray-500 truncate">{member.role}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button type="button" onClick={() => { setName(member.name); setRole(member.role); setIsEditing(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Ekip üyesini düzenle">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onDelete(member.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Ekip üyesini kaldır">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Supabase team_members.id (uuid) kolonuyla uyumsuz eski/yerel-kalma id'leri ayırt etmek için
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// crypto.randomUUID yalnızca güvenli bağlamda (https/localhost) mevcut; ağ IP'si üzerinden http erişiminde manuel üretime düşer
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Eski isimleri yeni ekip listesine pürüzsüz eşleme yardımcısı
function migrateAssignees(rawTasks: Task[], fallbackAssignee: Assignee): Task[] {
  return rawTasks.map(t => {
    const updatedAssignees = t.assignees && t.assignees.length > 0 ? t.assignees : [t.assignee || fallbackAssignee];
    const updatedAssignee = t.assignee || updatedAssignees[0] || fallbackAssignee;

    return {
      ...t,
      assignee: updatedAssignee,
      assignees: updatedAssignees.length > 0 ? updatedAssignees : [fallbackAssignee]
    };
  });
}

export default function App() {
  // Persistence state
  const [teamMembers, setTeamMembers] = useState<Assignee[]>(() => {
    try {
      const saved = localStorage.getItem('is_takip_team_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('is_takip_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return migrateAssignees(parsed, teamMembers[0] || {
            id: 'fallback-user',
            name: 'Atanmış Kişi',
            role: 'Üye',
            initials: 'AK',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          });
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('is_takip_projects');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [workspaceName, setWorkspaceName] = useState(WORKSPACE_NAME);
  const [activeView, setActiveView] = useState<ActiveView>('tablo');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');

  // Preview Mode: 'auto' | 'desktop' | 'mobile'
  const [previewMode, setPreviewMode] = useState<'auto' | 'desktop' | 'mobile'>('auto');
  const [mobileTab, setMobileTab] = useState<'gorevler' | 'filtreler' | 'ekip' | 'ayarlar'>('gorevler');

  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [inspectingTask, setInspectingTask] = useState<Task | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMemberName, setMobileMemberName] = useState('');
  const [mobileMemberRole, setMobileMemberRole] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('is_takip_team_members', JSON.stringify(teamMembers));
    } catch (e) {
      console.error(e);
    }
  }, [teamMembers]);

  useEffect(() => {
    try {
      localStorage.setItem('is_takip_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('is_takip_projects', JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  // Supabase ile başlangıç senkronizasyonu ve gerçek zamanlı (Realtime) dinleme
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    async function bootstrapSync() {
      try {
        const [remoteProjects, remoteTasks, remoteTeamMembers] = await Promise.all([
          getProjects(),
          getTasks(),
          getTeamMembers()
        ]);
        if (!isMounted) return;

        if (remoteTeamMembers.length > 0) {
          setTeamMembers(remoteTeamMembers.map(teamMemberRowToAssignee));
        }

        const hasRemoteData = remoteProjects.length > 0 || remoteTasks.length > 0 || remoteTeamMembers.length > 0;
        const hasLocalData = projects.length > 0 || tasks.length > 0 || teamMembers.length > 0;

        if (remoteProjects.length > 0) {
          setProjects(remoteProjects.map(projectRowToProject));
        } else if (projects.length > 0) {
          const created = await Promise.all(projects.map(p => addProject(projectToProjectInsert(p))));
          if (isMounted) setProjects(created.map(projectRowToProject));
        }

        if (remoteTasks.length > 0) {
          setTasks(remoteTasks.map(taskRowToTask));
        } else if (tasks.length > 0) {
          const created = await Promise.all(tasks.map(t => addTask(taskToTaskInsert(t))));
          if (isMounted) setTasks(created.map(taskRowToTask));
        }

        if (hasRemoteData || hasLocalData) {
          showToast('Supabase ile senkronize edildi.');
        }
      } catch (err) {
        console.warn('Supabase başlangıç verisi alınamadı:', err);
      }
    }

    bootstrapSync();

    const tasksChannel = subscribeToTasks({
      onInsert: (row) => setTasks(prev => (prev.some(t => t.id === row.id) ? prev : [taskRowToTask(row), ...prev])),
      onUpdate: (row) => setTasks(prev => prev.map(t => (t.id === row.id ? taskRowToTask(row) : t))),
      onDelete: (id) => setTasks(prev => prev.filter(t => t.id !== id))
    });

    const projectsChannel = subscribeToProjects({
      onInsert: (row) => setProjects(prev => (prev.some(p => p.id === row.id) ? prev : [...prev, projectRowToProject(row)])),
      onUpdate: (row) => setProjects(prev => prev.map(p => (p.id === row.id ? projectRowToProject(row) : p))),
      onDelete: (id) => setProjects(prev => prev.filter(p => p.id !== id))
    });

    const teamMembersChannel = subscribeToTeamMembers({
      onInsert: (row) => setTeamMembers(prev => (prev.some(m => m.id === row.id) ? prev : [...prev, teamMemberRowToAssignee(row)])),
      onUpdate: (row) => setTeamMembers(prev => prev.map(m => (m.id === row.id ? teamMemberRowToAssignee(row) : m))),
      onDelete: (id) => setTeamMembers(prev => prev.filter(m => m.id !== id))
    });

    return () => {
      isMounted = false;
      if (tasksChannel) supabase.removeChannel(tasksChannel);
      if (projectsChannel) supabase.removeChannel(projectsChannel);
      if (teamMembersChannel) supabase.removeChannel(teamMembersChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInputs = document.querySelectorAll('input[type="text"]');
        if (searchInputs.length > 0) {
          (searchInputs[0] as HTMLInputElement).focus();
        }
      } else if (!isTyping) {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          if (tasks.length > 0 && !inspectingTask && !isNewTaskOpen) {
            setInspectingTask(tasks[0]);
          }
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setIsNewTaskOpen(true);
        } else if (e.key === '1') {
          setActiveView('tablo');
        } else if (e.key === '2') {
          setActiveView('pano');
        } else if (e.key === '3') {
          setActiveView('cizelge');
        } else if (e.key === 'Escape') {
          setIsNewTaskOpen(false);
          setEditingTask(null);
          setInspectingTask(null);
          setIsSettingsOpen(false);
          setIsReportsOpen(false);
          setIsShortcutsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tasks, inspectingTask, isNewTaskOpen]);

  // Project task counts
  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.name] = 0; });
    tasks.forEach(t => {
      if (counts[t.project] !== undefined) {
        counts[t.project]++;
      } else {
        counts[t.project] = 1;
      }
    });
    return counts;
  }, [projects, tasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const taskAssignees = getTaskAssignees(t);

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAssignee = taskAssignees.some(a => a.name.toLowerCase().includes(q));
        const matches = 
          t.title.toLowerCase().includes(q) ||
          t.details.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          matchesAssignee;
        if (!matches) return false;
      }

      // Project filter
      if (selectedProject && t.project?.trim().toLowerCase() !== selectedProject.trim().toLowerCase()) {
        return false;
      }

      // Assignee filter
      if (selectedAssignee !== 'all') {
        const hasAssignee = taskAssignees.some(a => a.name === selectedAssignee || a.id === selectedAssignee);
        if (!hasAssignee) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'Aktif' && t.status !== 'Aktif' && t.status !== 'Kritik') return false;
        if (selectedStatus === 'Bitti' && t.status !== 'Bitti' && !t.completed) return false;
        if (selectedStatus === 'Beklemede' && t.status !== 'Beklemede') return false;
        if (selectedStatus === 'Kritik' && t.status !== 'Kritik') return false;
      }

      if (!isDateInRange(t.dueDate, dateRangeFilter as 'all' | 'this-week' | 'next-week' | 'this-month')) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, selectedProject, selectedAssignee, selectedStatus, dateRangeFilter]);

  // Task Actions
  const handleToggleComplete = async (taskId: string) => {
    let targetTask: Task | undefined;
    let previousTasks: Task[] = [];

    setTasks(prev => {
      previousTasks = prev;
      return prev.map(t => {
      if (t.id === taskId) {
        targetTask = t;
        const nextCompleted = !t.completed;
        const nextStatus = nextCompleted ? 'Bitti' : 'Aktif';
        showToast(nextCompleted ? `"${t.title}" tamamlandı olarak işaretlendi.` : `"${t.title}" aktifleştirildi.`);
        return {
          ...t,
          completed: nextCompleted,
          status: nextStatus,
          dueStatusNote: nextCompleted ? 'Tamamlandı' : t.dueStatusNote
        };
      }
      return t;
      });
    });

    if (isSupabaseConfigured && targetTask) {
      const nextCompleted = !targetTask.completed;
      try {
        await updateTask(taskId, {
          completed: nextCompleted,
          status: nextCompleted ? 'Bitti' : 'Aktif',
          due_status_note: nextCompleted ? 'Tamamlandı' : (targetTask.dueStatusNote ?? null)
        });
      } catch (e) {
        setTasks(previousTasks);
        console.error('Supabase durum güncelleme hatası:', e);
        showToast('Görev durumu kaydedilemedi; eski haline döndürüldü.');
      }
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const previousTasks = tasks;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completed: newStatus === 'Bitti'
        };
      }
      return t;
    }));
    showToast(`Görev durumu "${newStatus}" olarak güncellendi.`);

    if (isSupabaseConfigured) {
      try {
        await updateTask(taskId, {
          status: newStatus,
          completed: newStatus === 'Bitti'
        });
      } catch (e) {
        setTasks(previousTasks);
        console.error('Supabase durum güncelleme hatası:', e);
        showToast('Görev durumu kaydedilemedi; eski haline döndürüldü.');
      }
    }
  };

  const handleAddTeamMember = async (member: Assignee) => {
    const uniqueId = member.id || generateUuid();
    const newMember: Assignee = {
      ...member,
      id: uniqueId,
      initials: member.initials || member.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || '')
        .join('') || 'U',
      role: member.role || 'Üye',
      avatarUrl: member.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    setTeamMembers(prev => [...prev, newMember]);
    showToast(`"${newMember.name}" ekip listesine eklendi.`);

    if (isSupabaseConfigured) {
      try {
        const createdRow = await addTeamMember(assigneeToTeamMemberInsert(newMember));
        setTeamMembers(prev => prev.map(item => item.id === uniqueId ? teamMemberRowToAssignee(createdRow) : item));
      } catch (err) {
        console.error('Supabase ekip üyesi ekleme hatası:', err);
        setTeamMembers(prev => prev.filter(item => item.id !== uniqueId));
        showToast(`Ekip üyesi Supabase'e eklenemedi: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
      }
    }
  };

  const handleMobileAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = mobileMemberName.trim();
    if (!trimmedName) return;

    handleAddTeamMember({
      id: generateUuid(),
      name: trimmedName,
      role: mobileMemberRole.trim() || 'Üye',
      initials: trimmedName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || '')
        .join('') || 'U',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-indigo-100',
      badgeColor: 'text-indigo-800'
    });

    setMobileMemberName('');
    setMobileMemberRole('');
  };

  const handleUpdateTeamMember = async (memberId: string, name: string, role: string) => {
    const trimmedName = name.trim();
    const trimmedRole = role.trim() || 'Üye';
    const previousMember = teamMembers.find(member => member.id === memberId);
    if (!previousMember || !trimmedName) return;

    const initials = trimmedName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('') || 'U';
    const optimisticMember = { ...previousMember, name: trimmedName, role: trimmedRole, initials };
    setTeamMembers(prev => prev.map(member => member.id === memberId ? optimisticMember : member));
    showToast(`"${trimmedName}" bilgileri güncellendi.`);

    if (isSupabaseConfigured) {
      // Eski/senkronize olmamış kayıtlar (uuid formatında olmayan id) Supabase'de bulunmaz, bu yüzden önce oluşturulur.
      if (!UUID_REGEX.test(memberId)) {
        try {
          const createdRow = await addTeamMember(assigneeToTeamMemberInsert(optimisticMember));
          setTeamMembers(prev => prev.map(member => member.id === memberId ? teamMemberRowToAssignee(createdRow) : member));
        } catch (err) {
          console.error('Supabase ekip üyesi senkronizasyon hatası:', err);
          setTeamMembers(prev => prev.map(member => member.id === memberId ? previousMember : member));
          showToast('Ekip üyesi Supabase ile senkronize edilemedi.');
        }
        return;
      }

      try {
        const updatedRow = await updateTeamMember(memberId, { name: trimmedName, role: trimmedRole });
        setTeamMembers(prev => prev.map(member => member.id === memberId ? teamMemberRowToAssignee(updatedRow) : member));
      } catch (err) {
        setTeamMembers(prev => prev.map(member => member.id === memberId ? previousMember : member));
        console.error('Supabase ekip üyesi güncelleme hatası:', err);
        showToast('Ekip üyesi güncellenemedi.');
      }
    }
  };

  const handleDeleteTeamMember = async (memberId: string) => {
    const target = teamMembers.find(member => member.id === memberId);
    if (!target || !window.confirm(`"${target.name}" ekipten kaldırılsın mı?`)) return;

    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    showToast(`"${target.name}" ekipten kaldırıldı.`);

    // Uuid formatında olmayan id, hiç Supabase'e ulaşmamış eski bir kayıt demektir; silinecek bir şey yok.
    if (isSupabaseConfigured && UUID_REGEX.test(memberId)) {
      try {
        await deleteTeamMember(memberId);
      } catch (err) {
        setTeamMembers(prev => [...prev, target]);
        console.error('Supabase ekip üyesi silme hatası:', err);
        showToast('Ekip üyesi kaldırılamadı.');
      }
    }
  };

  const handleCreateProject = async (projectData: { name: string; color: string; description?: string }) => {
    const trimmedName = projectData.name.trim();
    const tempId = `p-${Date.now()}`;
    const previousSelectedProject = selectedProject;
    const newProject: Project = {
      id: tempId,
      name: trimmedName,
      color: projectData.color,
      description: projectData.description
    };
    setProjects(prev => [...prev, newProject]);
    setSelectedProject(newProject.name);
    showToast(`"${newProject.name}" projesi oluşturuldu ve seçildi.`);

    if (isSupabaseConfigured) {
      try {
        const createdRow = await addProject(projectToProjectInsert(newProject));
        setProjects(prev => prev.map(p => p.id === tempId ? projectRowToProject(createdRow) : p));
      } catch (err) {
        console.error('Supabase proje ekleme hatası:', err);
        setProjects(prev => prev.filter(project => project.id !== tempId));
        setSelectedProject(previousSelectedProject);
        showToast('Proje kaydedilemedi; değişiklik geri alındı.');
      }
    }
  };

  const handleDeleteProject = async (projectId: string, deleteTasks: boolean) => {
    const target = projects.find(p => p.id === projectId);
    if (!target) return;

    setProjects(prev => prev.filter(p => p.id !== projectId));

    const affectedTasks = tasks.filter(t => t.project === target.name);
    const previousProjects = projects;
    const previousTasks = tasks;
    const previousSelectedProject = selectedProject;

    if (deleteTasks) {
      setTasks(prev => prev.filter(t => t.project !== target.name));
      showToast(`"${target.name}" projesi ve ilgili tüm görevler silindi.`);
    } else {
      setTasks(prev => prev.map(t => t.project === target.name ? { ...t, project: 'Genel' } : t));
      showToast(`"${target.name}" projesi silindi. Görevler genel projeye aktarıldı.`);
    }

    if (selectedProject === target.name) {
      setSelectedProject(null);
    }

    if (isSupabaseConfigured) {
      try {
        await deleteProject(projectId);
        if (deleteTasks) {
          await Promise.all(affectedTasks.map(t => deleteTask(t.id)));
        } else {
          await Promise.all(affectedTasks.map(t => updateTask(t.id, { project: 'Genel' })));
        }
      } catch (err) {
        console.error('Supabase proje silme hatası:', err);
        setProjects(previousProjects);
        setTasks(previousTasks);
        setSelectedProject(previousSelectedProject);
        showToast('Proje silinemedi; değişiklik geri alındı.');
      }
    }
  };

  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const tempId = `task-${Date.now()}`;
    const newTask: Task = {
      ...newTaskData,
      id: tempId,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);

    // Eğer kullanıcı başka bir projede iken farklı bir projeye görev eklediyse, o projeye geçerek görevi görmesini sağla
    if (selectedProject && selectedProject.trim().toLowerCase() !== newTask.project.trim().toLowerCase()) {
      setSelectedProject(newTask.project);
    }
    showToast(`"${newTask.title}" [${newTask.project}] kaydedildi.`);

    // Supabase entegrasyonu: Veritabanına kaydet ve gerçek UUID ile güncelle
    if (isSupabaseConfigured) {
      try {
        const createdRow = await addTask(taskToTaskInsert(newTask));
        setTasks(prev => prev.map(t => t.id === tempId ? taskRowToTask(createdRow) : t));
      } catch (err) {
        console.error('Supabase görev ekleme hatası:', err);
        setTasks(prev => prev.filter(task => task.id !== tempId));
        showToast('Görev kaydedilemedi; değişiklik geri alındı.');
      }
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    const previousTask = tasks.find(task => task.id === updatedTask.id);
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    showToast(`"${updatedTask.title}" güncellendi.`);

    if (isSupabaseConfigured) {
      try {
        await updateTask(updatedTask.id, taskToTaskInsert(updatedTask));
      } catch (err) {
        console.error('Supabase güncelleme hatası:', err);
        if (previousTask) {
          setTasks(prev => prev.map(task => task.id === updatedTask.id ? previousTask : task));
        }
        showToast('Görev güncellenemedi; değişiklik geri alındı.');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast(`"${target?.title || 'Görev'}" silindi.`);

    if (isSupabaseConfigured) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error('Supabase silme hatası:', err);
        if (target) setTasks(prev => [target, ...prev]);
        showToast('Görev silinemedi; geri yüklendi.');
      }
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    const tempId = `task-${Date.now()}`;
    const duplicated: Task = {
      ...task,
      id: tempId,
      code: `CPY-${Math.floor(100 + Math.random() * 900)}`,
      title: `${task.title} (Kopya)`,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [duplicated, ...prev]);
    showToast(`"${duplicated.title}" çoğaltıldı.`);

    if (isSupabaseConfigured) {
      try {
        const createdRow = await addTask(taskToTaskInsert(duplicated));
        setTasks(prev => prev.map(t => t.id === tempId ? taskRowToTask(createdRow) : t));
      } catch (err) {
        console.error('Supabase görev çoğaltma hatası:', err);
        setTasks(prev => prev.filter(task => task.id !== tempId));
        showToast('Görev çoğaltılamadı; değişiklik geri alındı.');
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAssignee('all');
    setSelectedStatus('all');
    setSelectedProject(null);
    setDateRangeFilter('all');
  };

  // Excel Export
  const handleExportExcel = (exportTasks = filteredTasks) => {
    const tasksToExport = Array.isArray(exportTasks) ? exportTasks : filteredTasks;
    setIsExporting(true);
    setTimeout(() => {
      try {
        const exportedAt = new Date();
        const exportedAtText = exportedAt.toLocaleString('tr-TR');
        const taskHeaders = ['Görev Kodu', 'Görev', 'Açıklama', 'Proje', 'Başlangıç', 'Teslim', 'Sorumlular', 'Durum', 'Tamamlandı', 'Öncelik'];
        const taskRows = tasksToExport.map(task => ({
          'Görev Kodu': task.code,
          'Görev': task.title,
          'Açıklama': task.details,
          'Proje': task.project,
          'Başlangıç': task.startDate,
          'Teslim': task.dueDate,
          'Sorumlular': getTaskAssignees(task).map(assignee => assignee.name).join(', '),
          'Durum': task.status,
          'Tamamlandı': task.completed || task.status === 'Bitti' ? 'Evet' : 'Hayır',
          'Öncelik': task.priority || ''
        }));
        const projectRows = projects.map(project => ({
          'Proje': project.name,
          'Açıklama': project.description || '',
          'Renk': project.color,
          'Görev Sayısı': tasks.filter(task => task.project === project.name).length
        }));

        const workbook = XLSX.utils.book_new();
        const addReportSheet = (sheetName: string, rows: Record<string, unknown>[], headers: string[]) => {
          const sheetRows = [
            ['Çalışma Alanı', workspaceName],
            ['Dışa Aktarma Tarihi', exportedAtText],
            [],
            headers,
            ...rows.map(row => headers.map(header => row[header] ?? ''))
          ];
          const sheet = XLSX.utils.aoa_to_sheet(sheetRows);
          sheet['!cols'] = headers.map(header => ({ wch: Math.max(header.length + 2, 16) }));
          XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
        };

        addReportSheet('Görevler', taskRows, taskHeaders);
        addReportSheet('Projeler', projectRows, ['Proje', 'Açıklama', 'Renk', 'Görev Sayısı']);
        addReportSheet('Aktif', taskRows.filter(row => row['Durum'] === 'Aktif'), taskHeaders);
        addReportSheet('Beklemede', taskRows.filter(row => row['Durum'] === 'Beklemede'), taskHeaders);
        addReportSheet('Kritik', taskRows.filter(row => row['Durum'] === 'Kritik'), taskHeaders);
        addReportSheet('Tamamlanan', taskRows.filter(row => row['Tamamlandı'] === 'Evet'), taskHeaders);

        XLSX.writeFile(workbook, `is_takip_raporu_${exportedAt.toISOString().slice(0, 10)}.xlsx`);
        showToast('Excel dosyası başarıyla dışa aktarıldı.');
      } catch (err) {
        console.error('Excel dışa aktarma hatası:', err);
        showToast('Excel dosyası oluşturulamadı.');
      } finally {
        setIsExporting(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#141b2b] flex flex-col font-['Inter',sans-serif]">
      {/* Top Header */}
      <Header
        onOpenNewTask={() => setIsNewTaskOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        activeWorkspace={workspaceName}
        setActiveWorkspace={setWorkspaceName}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex w-full">
        {/* If Mobile Preview Mode is explicitly active, render the dedicated mobile frame */}
        {previewMode === 'mobile' ? (
          <div className="w-full flex justify-center py-6 px-4 bg-[#eceef7]">
            <div className="w-full max-w-md bg-[#f7f8fc] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative min-h-[750px] p-3">
              {mobileTab === 'ekip' ? (
                <div className="w-full max-w-md mx-auto flex flex-col gap-3.5 pb-24">
                  <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-900">Ekip</h3>
                      <span className="text-[11px] text-gray-500">{teamMembers.length} üye</span>
                    </div>

                    <form onSubmit={handleMobileAddTeamMember} className="flex flex-col gap-2.5">
                      <input
                        type="text"
                        value={mobileMemberName}
                        onChange={(e) => setMobileMemberName(e.target.value)}
                        placeholder="Yeni ekip arkadaşı adı"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        value={mobileMemberRole}
                        onChange={(e) => setMobileMemberRole(e.target.value)}
                        placeholder="Rol (opsiyonel)"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={!mobileMemberName.trim()}
                        className="w-full px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-lg"
                      >
                        Ekip Üyesi Ekle
                      </button>
                    </form>
                  </section>

                  <section className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs">
                    <div className="space-y-2.5">
                      {teamMembers.map((member) => (
                        <MobileTeamMemberRow key={member.id} member={member} onUpdate={handleUpdateTeamMember} onDelete={handleDeleteTeamMember} />
                      ))}

                      {teamMembers.length === 0 && (
                        <div className="text-center text-xs text-gray-500 py-4">Henüz ekip üyesi eklenmedi.</div>
                      )}
                    </div>
                  </section>
                </div>
              ) : (
                <MobileTaskView
                  tasks={tasks}
                  projects={projects}
                  selectedProject={selectedProject}
                  onSelectProject={setSelectedProject}
                  onToggleComplete={handleToggleComplete}
                  onEditTask={setEditingTask}
                  onSelectTask={setInspectingTask}
                  onOpenNewTask={() => setIsNewTaskOpen(true)}
                  onOpenFiltersModal={() => setIsSettingsOpen(true)}
                  onExportExcel={handleExportExcel}
                  isExporting={isExporting}
                />
              )}
              <BottomNav
                activeTab={mobileTab}
                setActiveTab={setMobileTab}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Sidebar (visible on lg screens, hidden on small screens) */}
            <div className={`${previewMode === 'desktop' ? 'block' : 'hidden lg:block'}`}>
              <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                projects={projects}
                projectCounts={projectCounts}
                onOpenNewProject={() => setIsNewProjectOpen(true)}
                onOpenReports={() => setIsReportsOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onDeleteProject={(proj) => setProjectToDelete(proj)}
              />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 px-4 lg:px-8 py-6 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
              {/* Mobile screen alternative when screen is narrow and previewMode is 'auto' */}
              <div className="block lg:hidden">
                {mobileTab === 'ekip' ? (
                  <div className="w-full max-w-md mx-auto flex flex-col gap-3.5 pb-24">
                    <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Ekip</h3>
                        <span className="text-[11px] text-gray-500">{teamMembers.length} üye</span>
                      </div>

                      <form onSubmit={handleMobileAddTeamMember} className="flex flex-col gap-2.5">
                        <input
                          type="text"
                          value={mobileMemberName}
                          onChange={(e) => setMobileMemberName(e.target.value)}
                          placeholder="Yeni ekip arkadaşı adı"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          value={mobileMemberRole}
                          onChange={(e) => setMobileMemberRole(e.target.value)}
                          placeholder="Rol (opsiyonel)"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={!mobileMemberName.trim()}
                          className="w-full px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-lg"
                        >
                          Ekip Üyesi Ekle
                        </button>
                      </form>
                    </section>

                    <section className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs">
                      <div className="space-y-2.5">
                        {teamMembers.map((member) => (
                          <MobileTeamMemberRow key={member.id} member={member} onUpdate={handleUpdateTeamMember} onDelete={handleDeleteTeamMember} />
                        ))}

                        {teamMembers.length === 0 && (
                          <div className="text-center text-xs text-gray-500 py-4">Henüz ekip üyesi eklenmedi.</div>
                        )}
                      </div>
                    </section>
                  </div>
                ) : (
                  <MobileTaskView
                    tasks={tasks}
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelectProject={setSelectedProject}
                    onToggleComplete={handleToggleComplete}
                    onEditTask={setEditingTask}
                    onSelectTask={setInspectingTask}
                    onOpenNewTask={() => setIsNewTaskOpen(true)}
                    onOpenFiltersModal={() => setIsSettingsOpen(true)}
                    onExportExcel={handleExportExcel}
                    isExporting={isExporting}
                  />
                )}
                <BottomNav
                  activeTab={mobileTab}
                  setActiveTab={setMobileTab}
                />
              </div>

              {/* Desktop Full View (Shown on desktop or when 'desktop' preview is chosen) */}
              <div className={`${previewMode === 'desktop' ? 'flex' : 'hidden lg:flex'} flex-col gap-6 w-full`}>
                {/* 1. Top Summary Stats Bar (Project-scoped) */}
                <StatsCards
                  tasks={tasks}
                  selectedProject={selectedProject}
                  projects={projects}
                  onSelectProject={setSelectedProject}
                  onFilterStatusClick={(status) => setSelectedStatus(status)}
                />

                {/* 2. Controls & Filters Bar */}
                <ControlBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedAssignee={selectedAssignee}
                  onAssigneeChange={setSelectedAssignee}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  dateRangeFilter={dateRangeFilter}
                  onDateRangeChange={setDateRangeFilter}
                  activeView={activeView}
                  onViewChange={setActiveView}
                  assignees={teamMembers.length > 0 ? teamMembers : []}
                  onExportExcel={handleExportExcel}
                  isExporting={isExporting}
                />

                {/* Selected Project Notification / Filter Tag */}
                {selectedProject && (
                  <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-100 px-4 py-2 rounded-xl text-xs text-indigo-900">
                    <span className="font-medium">
                      Filtrelenen Proje: <strong className="font-bold">{selectedProject}</strong> ({filteredTasks.length} görev)
                    </span>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline ml-3"
                    >
                      Filtreyi Kaldır
                    </button>
                  </div>
                )}

                {/* 3. Main Dynamic Content View */}
                {activeView === 'tablo' && (
                  <TaskTableView
                    tasks={filteredTasks}
                    onToggleComplete={handleToggleComplete}
                    onEditTask={setEditingTask}
                    onDuplicateTask={handleDuplicateTask}
                    onDeleteTask={handleDeleteTask}
                    onSelectTask={setInspectingTask}
                    onResetFilters={handleResetFilters}
                  />
                )}

                {activeView === 'pano' && (
                  <TaskKanbanView
                    tasks={filteredTasks}
                    onToggleComplete={handleToggleComplete}
                    onUpdateStatus={handleUpdateStatus}
                    onSelectTask={setInspectingTask}
                    onOpenNewTask={() => setIsNewTaskOpen(true)}
                    onEditTask={setEditingTask}
                  />
                )}

                {activeView === 'cizelge' && (
                  <TaskTimelineView
                    tasks={filteredTasks}
                    onSelectTask={setInspectingTask}
                  />
                )}

                {activeView === 'takvim' && (
                  <TaskCalendarView
                    tasks={filteredTasks}
                    onSelectTask={setInspectingTask}
                  />
                )}

                {/* 4. Bottom Productivity & Insight Widgets */}
                <ProductivityWidgets
                  tasks={tasks}
                  onOpenShortcuts={() => setIsShortcutsOpen(true)}
                  onOpenResourcePlan={() => setIsReportsOpen(true)}
                />
              </div>
            </main>
          </>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onSaveTask={handleCreateTask}
        projects={projects}
        assignees={teamMembers.length > 0 ? teamMembers : []}
        defaultProject={selectedProject}
        onOpenNewProjectModal={() => setIsNewProjectOpen(true)}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <DeleteProjectModal
        project={projectToDelete}
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        taskCount={projectToDelete ? tasks.filter(t => t.project === projectToDelete.name).length : 0}
        onConfirmDelete={handleDeleteProject}
      />

      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onUpdateTask={handleUpdateTask}
        projects={projects}
        assignees={teamMembers.length > 0 ? teamMembers : []}
      />

      <TaskDetailModal
        task={inspectingTask}
        onClose={() => setInspectingTask(null)}
        onToggleComplete={handleToggleComplete}
        onUpdateStatus={handleUpdateStatus}
        onDeleteTask={handleDeleteTask}
        onEditTask={setEditingTask}
      />

      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        workspaceName={workspaceName}
        onUpdateWorkspaceName={setWorkspaceName}
        projects={projects}
        teamMembers={teamMembers}
        onDeleteProject={(proj) => setProjectToDelete(proj)}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onAddTeamMember={handleAddTeamMember}
        onUpdateTeamMember={handleUpdateTeamMember}
        onDeleteTeamMember={handleDeleteTeamMember}
      />

      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        tasks={tasks}
        projects={projects}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
