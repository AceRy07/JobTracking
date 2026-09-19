import React, { useState } from 'react';
import { 
  Check, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  MoreVertical, 
  MessageSquare, 
  Paperclip, 
  Link as LinkIcon, 
  Code2, 
  CheckCircle2, 
  Edit3, 
  Eye, 
  Plus, 
  Search, 
  SlidersHorizontal,
  X,
  BarChart3
} from 'lucide-react';
import { Task, TaskStatus, Project, getTaskAssignees } from '../types';
import { AssigneeAvatarGroup } from './AssigneeAvatarGroup';

interface MobileTaskViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onOpenFiltersModal?: () => void;
  projects?: Project[];
  selectedProject?: string | null;
  onSelectProject?: (proj: string | null) => void;
}

export const MobileTaskView: React.FC<MobileTaskViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onSelectTask,
  onOpenNewTask,
  onOpenFiltersModal,
  projects = [],
  selectedProject = null,
  onSelectProject
}) => {
  const [filterChip, setFilterChip] = useState<'all' | 'Aktif' | 'Bitti' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Projeye göre görevler
  const projectScopedTasks = selectedProject
    ? tasks.filter(t => t.project === selectedProject)
    : tasks;

  const total = projectScopedTasks.length;
  const activeCount = projectScopedTasks.filter(t => t.status === 'Aktif' || t.status === 'Kritik').length;
  const completedCount = projectScopedTasks.filter(t => t.status === 'Bitti' || t.completed).length;

  const filteredTasks = projectScopedTasks.filter((t) => {
    const taskAssignees = getTaskAssignees(t);
    const matchesAssignee = taskAssignees.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matchesAssignee;

    if (!matchesSearch) return false;

    if (filterChip === 'Aktif') return t.status === 'Aktif' || t.status === 'Kritik';
    if (filterChip === 'Bitti') return t.status === 'Bitti' || t.completed;
    if (filterChip === 'mine') return taskAssignees.length > 0;
    return true;
  });

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3.5 pb-24 text-[#101828]">
      {/* 1. COMPACT SUMMARY STATS */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <h1 className="text-sm font-bold tracking-tight">Genel Görev Durumu</h1>
        </div>
        <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setFilterChip('all')}
          className="flex flex-col items-center justify-center gap-0.5 min-h-[80px] rounded-xl bg-white border border-slate-200 shadow-sm transition-all hover:border-indigo-200"
        >
          <span className="text-[11px] text-gray-500 font-medium">Toplam</span>
          <span className="text-xl text-gray-900 font-bold leading-none">{total}</span>
          <span className="text-[10px] text-gray-400">Tüm Görev</span>
        </button>

        <button
          onClick={() => setFilterChip('Aktif')}
          className="flex flex-col items-center justify-center gap-0.5 min-h-[80px] rounded-xl bg-amber-50/60 border border-amber-300 shadow-sm transition-all hover:border-amber-400"
        >
          <span className="text-[11px] text-amber-800 font-medium">Devam Eden</span>
          <span className="text-xl text-amber-800 font-bold leading-none">{activeCount}</span>
          <span className="text-[10px] text-amber-700/70">Yapılacak</span>
        </button>

        <button
          onClick={() => setFilterChip('Bitti')}
          className="flex flex-col items-center justify-center gap-0.5 min-h-[80px] rounded-xl bg-emerald-50/60 border border-emerald-300 shadow-sm transition-all hover:border-emerald-400"
        >
          <span className="text-[11px] text-emerald-800 font-medium">Tamamlanan</span>
          <span className="text-xl text-emerald-800 font-bold leading-none">{completedCount}</span>
          <span className="text-[10px] text-emerald-700/70">Bitti</span>
        </button>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CHIPS CAROUSEL */}
      <section className="flex flex-col gap-2.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Görev adı veya sorumlu ara..."
            className="w-full h-10 pl-9 pr-9 bg-white text-gray-800 text-xs sm:text-sm rounded-xl shadow-sm border border-slate-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenFiltersModal}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Project Selector Pills */}
        {projects.length > 0 && onSelectProject && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            <button
              onClick={() => onSelectProject(null)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedProject === null
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>Tüm Projeler</span>
              <span className="text-[10px] opacity-75">({tasks.length})</span>
            </button>

            {projects.map((proj) => {
              const isSelected = selectedProject === proj.name;
              const pCount = tasks.filter(t => t.project === proj.name).length;
              return (
                <button
                  key={proj.id}
                  onClick={() => onSelectProject(isSelected ? null : proj.name)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#ffffff' : proj.color }}
                  />
                  <span>{proj.name}</span>
                  <span className="text-[10px] opacity-75">({pCount})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Filter Pills Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          <button
            onClick={() => setFilterChip('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs flex items-center gap-1 ${
              filterChip === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <span>Tümü</span>
            <span className="text-[10px] opacity-80">{total}</span>
          </button>

          <button
            onClick={() => setFilterChip('Aktif')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 ${
              filterChip === 'Aktif'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Aktif</span>
            <span className="text-[10px] opacity-75">{activeCount}</span>
          </button>

          <button
            onClick={() => setFilterChip('Bitti')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 ${
              filterChip === 'Bitti'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Bitti</span>
            <span className="text-[10px] opacity-75">{completedCount}</span>
          </button>

          <button
            onClick={() => setFilterChip('mine')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs ${
              filterChip === 'mine'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <span>Bana Atananlar</span>
          </button>
        </div>
      </section>

      {/* 3. STACKED TASK CARDS LIST */}
      <main className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-indigo-600" />
            <h2 className="text-sm font-bold">{filterChip === 'Bitti' ? 'Tamamlanan Görevler' : 'Devam Eden Görevler'}</h2>
          </div>
          <span className="text-[11px] text-gray-500">{filteredTasks.length} Görev</span>
        </div>
        {filteredTasks.map((task) => {
          const isDone = task.completed || task.status === 'Bitti';
          const isCritical = task.status === 'Kritik';
          const primaryAssignee = getTaskAssignees(task)[0];

          // Left border accent color
          const borderAccent = isDone
            ? 'bg-emerald-500'
            : isCritical
            ? 'bg-red-500'
            : task.status === 'Beklemede'
            ? 'bg-gray-400'
            : 'bg-amber-500';

          return (
            <article
              key={task.id}
              className={`relative flex flex-col p-3.5 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all overflow-hidden ${
                isDone ? 'bg-emerald-50/25 opacity-90' : isCritical ? 'bg-red-50/25' : 'bg-white'
              }`}
            >
              {/* Colored left bar indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${borderAccent}`} />

              <div className="flex items-start gap-2 pl-2">
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all border ${
                    isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 text-transparent hover:text-gray-400'
                  }`}
                  title={isDone ? 'Geri al' : 'Tamamlandı yap'}
                >
                  <Check className="w-4 h-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 text-[10px] font-bold tracking-wide">{task.code}</span>
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-bold"><Check className="w-3 h-3" /> Başarıyla Tamamlandı</span>
                    ) : isCritical ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-700 text-white text-[10px] font-bold"><AlertTriangle className="w-3 h-3" /> Acil &amp; Kritik</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Devam Ediyor</span>
                    )}
                  </div>
                  <h2 onClick={() => onSelectTask(task)} className={`mt-1 text-base font-bold leading-snug cursor-pointer hover:text-indigo-600 ${isDone ? 'line-through text-gray-500' : 'text-slate-950'}`}>
                    {task.title}
                  </h2>
                </div>
              </div>

              <div onClick={() => onSelectTask(task)} className="mt-3 ml-2 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                <p className="text-xs text-slate-800 leading-relaxed">
                  <span className="font-bold block mb-1">Açıklama &amp; Yapılacak İş:</span>
                  {task.details || 'Bu görev için açıklama eklenmedi.'}
                </p>
              </div>

              <div className={`mt-3 ml-2 rounded-xl border p-3 ${isDone ? 'bg-emerald-50 border-emerald-100' : isCritical ? 'bg-rose-50 border-rose-100' : 'bg-amber-50/60 border-amber-100'}`}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Calendar className={`w-4 h-4 ${isCritical ? 'text-rose-600' : isDone ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <span>Son Teslim Tarihi:</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-slate-900">{task.dueDate || 'Tarih belirtilmedi'}</span>
                    {task.dueStatusNote && <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${isCritical ? 'bg-rose-600 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-amber-300 text-amber-900'}`}>{task.dueStatusNote}</span>}
                  </div>
                </div>
              </div>

              <div className="mt-3 ml-2 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full border border-slate-400">◉</span>
                  <span>Görev<br />Sorumlusu:</span>
                </div>
                {primaryAssignee ? (
                  <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-2.5 py-1.5">
                    <img src={primaryAssignee.avatarUrl} alt={primaryAssignee.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-semibold text-slate-900">{primaryAssignee.name}</span>
                  </div>
                ) : <span className="text-xs text-slate-500">Atanmadı</span>}
              </div>

              <div className="mt-3 ml-2 flex flex-col gap-2 border-t border-slate-200 pt-3">
                <button onClick={() => onToggleComplete(task.id)} className={`w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-bold transition-colors ${isDone ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-emerald-100 border-emerald-400 text-emerald-900 hover:bg-emerald-200'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isDone ? 'Geri Al' : 'Görevi Tamamla'}</span>
                </button>
                <button onClick={() => onEditTask(task)} className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
                  <Edit3 className="w-4 h-4" />
                  <span>Düzenle</span>
                </button>
              </div>
            </article>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm font-semibold text-gray-700">Seçilen kriterde görev yok</p>
            <p className="text-xs text-gray-400 mt-1">Filtreleri değiştirerek tekrar deneyin.</p>
            <button
              onClick={() => {
                setFilterChip('all');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg font-medium"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        )}
      </main>

      {/* 4. FLOATING ACTION BUTTON */}
      <aside className="fixed right-5 bottom-20 z-40">
        <button
          onClick={onOpenNewTask}
          className="inline-flex items-center gap-2 h-10 px-4 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-300/40 hover:shadow-xl hover:bg-indigo-700 active:scale-95 transition-all font-semibold text-xs border-2 border-white"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni İş Ekle</span>
        </button>
      </aside>
    </div>
  );
};
