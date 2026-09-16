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
  X
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
  const [filterChip, setFilterChip] = useState<'all' | 'Aktif' | 'Bitti' | 'mine' | 'arda'>('all');
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
    if (filterChip === 'mine' || filterChip === 'arda') return taskAssignees.some(a => a.name.includes('Arda') || a.id === 'arda');
    return true;
  });

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3.5 pb-24">
      {/* 1. COMPACT SUMMARY STATS */}
      <section className="flex items-center justify-between gap-1.5 p-2 bg-[#f1f3ff] rounded-xl shadow-xs">
        <button
          onClick={() => setFilterChip('all')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-xs flex-1 justify-center transition-all hover:bg-gray-50"
        >
          <span className="text-xs text-gray-500 font-medium">Toplam</span>
          <span className="text-sm text-gray-900 font-bold">{total}</span>
        </button>

        <button
          onClick={() => setFilterChip('Aktif')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-xs flex-1 justify-center transition-all hover:bg-gray-50"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-xs text-amber-700 font-medium">Aktif</span>
          <span className="text-sm text-amber-700 font-bold">{activeCount}</span>
        </button>

        <button
          onClick={() => setFilterChip('Bitti')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-xs flex-1 justify-center transition-all hover:bg-gray-50"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span className="text-xs text-emerald-700 font-medium">Bitti</span>
          <span className="text-sm text-emerald-700 font-bold">{completedCount}</span>
        </button>
      </section>

      {/* 2. SEARCH & FILTER CHIPS CAROUSEL */}
      <section className="flex flex-col gap-2.5">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İşlerde ara..."
            className="w-full h-10 pl-9 pr-9 bg-white text-gray-800 text-xs sm:text-sm rounded-xl shadow-xs border border-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            Bana Atananlar
          </button>

          <button
            onClick={() => setFilterChip('arda')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs flex items-center gap-1 ${
              filterChip === 'arda'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              alt="Arda"
              className="w-3.5 h-3.5 rounded-full object-cover"
            />
            <span>Arda A.</span>
          </button>
        </div>
      </section>

      {/* 3. STACKED TASK CARDS LIST */}
      <main className="flex flex-col gap-3">
        {filteredTasks.map((task) => {
          const isDone = task.completed || task.status === 'Bitti';
          const isCritical = task.status === 'Kritik';

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
              className={`relative flex flex-col p-4 bg-white rounded-xl shadow-xs border border-gray-100 hover:shadow-md transition-all overflow-hidden ${
                isDone ? 'opacity-85' : ''
              }`}
            >
              {/* Colored left bar indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${borderAccent}`} />

              {/* Top Row */}
              <div className="flex items-start justify-between gap-2 pl-1">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {/* Status Toggle Box */}
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-transparent hover:text-gray-400 border border-gray-200'
                    }`}
                    title={isDone ? 'Geri al' : 'Tamamlandı yap'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {task.code}
                      </span>
                      {isCritical ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <span className="text-[11px] text-gray-400">• {task.project}</span>
                      )}
                    </div>

                    <h2
                      onClick={() => onSelectTask(task)}
                      className={`text-sm font-semibold cursor-pointer hover:text-indigo-600 transition-colors leading-snug ${
                        isDone ? 'line-through text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Bitti
                    </span>
                  ) : isCritical ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      Kritik
                    </span>
                  ) : task.status === 'Beklemede' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold">
                      Beklemede
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Aktif
                    </span>
                  )}

                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Task Details */}
              <div 
                onClick={() => onSelectTask(task)}
                className="pl-8 mt-1.5 cursor-pointer"
              >
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold text-gray-800">Yapılacak İş: </span>
                  {task.details}
                </p>
              </div>

              {/* Metadata Box */}
              <div className="mt-2.5 pl-8 flex flex-col gap-1.5 pt-1.5 bg-[#f1f3ff]/60 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Başlangıç:</span>
                    <span className="text-gray-800 font-medium">{task.startDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-gray-800 font-medium">{task.dueDate}</span>
                    {task.dueStatusNote && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCritical
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        ({task.dueStatusNote})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Sorumlular:</span>
                  </div>
                  <AssigneeAvatarGroup assignees={getTaskAssignees(task)} size="sm" />
                </div>
              </div>

              {/* Quick Action Footer */}
              <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between pl-8">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {task.commentsCount ? (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      <span>{task.commentsCount} yorum</span>
                    </div>
                  ) : null}

                  {task.filesCount ? (
                    <div className="flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                      <span>{task.filesCount} dosya</span>
                    </div>
                  ) : null}

                  {task.figmaLink ? (
                    <div className="flex items-center gap-1 text-indigo-600">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>{task.figmaLink}</span>
                    </div>
                  ) : null}

                  {task.category ? (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{task.category}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditTask(task)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Düzenle</span>
                  </button>

                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isDone
                        ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isDone ? 'Geri al' : 'Tamamla'}</span>
                  </button>
                </div>
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
          className="inline-flex items-center gap-2 h-12 px-5 bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-indigo-700 active:scale-95 transition-all font-semibold text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni İş Ekle</span>
        </button>
      </aside>
    </div>
  );
};
