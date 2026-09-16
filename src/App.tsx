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

import { ActiveView, Project, Task, TaskStatus, getTaskAssignees } from './types';
import { INITIAL_TASKS, PROJECTS, ASSIGNEES } from './data/initialData';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Persistence state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('is_takip_tasks');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TASKS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('is_takip_projects');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return PROJECTS;
  });

  const [workspaceName, setWorkspaceName] = useState('Acme Tech Workspace');
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Sync to localStorage
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
      if (selectedProject && t.project !== selectedProject) {
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

      return true;
    });
  }, [tasks, searchQuery, selectedProject, selectedAssignee, selectedStatus]);

  // Task Actions
  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
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
    }));
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
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
  };

  const handleCreateProject = (projectData: { name: string; color: string; description?: string }) => {
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: projectData.name,
      color: projectData.color,
      description: projectData.description
    };
    setProjects(prev => [...prev, newProject]);
    showToast(`"${newProject.name}" projesi başarıyla oluşturuldu.`);
  };

  const handleDeleteProject = (projectId: string, deleteTasks: boolean) => {
    const target = projects.find(p => p.id === projectId);
    if (!target) return;

    setProjects(prev => prev.filter(p => p.id !== projectId));

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
  };

  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    showToast(`"${newTask.title}" başarıyla oluşturuldu.`);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    showToast(`"${updatedTask.title}" güncellendi.`);
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast(`"${target?.title || 'Görev'}" silindi.`);
  };

  const handleDuplicateTask = (task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}`,
      code: `CPY-${Math.floor(100 + Math.random() * 900)}`,
      title: `${task.title} (Kopya)`,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [duplicated, ...prev]);
    showToast(`"${duplicated.title}" çoğaltıldı.`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAssignee('all');
    setSelectedStatus('all');
    setSelectedProject(null);
    setDateRangeFilter('all');
  };

  // CSV Export
  const handleExportCsv = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const headers = ['Görev Kodu', 'Madde Açıklama', 'Yapılacak İş', 'Proje', 'Başlangıç', 'Teslim', 'Sorumlular', 'Durum'];
        const rows = filteredTasks.map(t => [
          `"${t.code}"`,
          `"${t.title.replace(/"/g, '""')}"`,
          `"${t.details.replace(/"/g, '""')}"`,
          `"${t.project}"`,
          `"${t.startDate}"`,
          `"${t.dueDate}"`,
          `"${getTaskAssignees(t).map(a => a.name).join('; ')}"`,
          `"${t.status}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `is_takip_raporu_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV dosyası başarıyla dışa aktarıldı.');
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex flex-col font-['Inter',sans-serif]">
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
            <div className="w-full max-w-md bg-[#f9f9ff] rounded-3xl shadow-2xl overflow-hidden border border-gray-300 relative min-h-[750px] p-4">
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
              />
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
                />
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
                  assignees={ASSIGNEES}
                  onExportCsv={handleExportCsv}
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
        assignees={ASSIGNEES}
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
        assignees={ASSIGNEES}
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
        onDeleteProject={(proj) => setProjectToDelete(proj)}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
      />

      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        tasks={tasks}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
