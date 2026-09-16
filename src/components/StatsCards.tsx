import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  PauseCircle, 
  TrendingUp, 
  CheckCheck,
  FolderOpen,
  Filter,
  X
} from 'lucide-react';
import { Task, Project } from '../types';

interface StatsCardsProps {
  tasks: Task[];
  onFilterStatusClick?: (status: string) => void;
  selectedProject?: string | null;
  projects?: Project[];
  onSelectProject?: (proj: string | null) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  tasks, 
  onFilterStatusClick,
  selectedProject,
  projects = [],
  onSelectProject
}) => {
  // Projeye göre filtrelenmiş görevler
  const projectTasks = selectedProject 
    ? tasks.filter(t => t.project === selectedProject)
    : tasks;

  const total = projectTasks.length;
  const active = projectTasks.filter(t => t.status === 'Aktif' || t.status === 'Kritik').length;
  const completed = projectTasks.filter(t => t.status === 'Bitti' || t.completed).length;
  const pending = projectTasks.filter(t => t.status === 'Beklemede').length;

  const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;

  const currentProjectObj = projects.find(p => p.name === selectedProject);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Project Scope Context Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div className="flex items-center gap-2">
          {selectedProject ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200/70 rounded-lg text-xs font-semibold text-indigo-900 shadow-2xs">
              <span 
                className="w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ backgroundColor: currentProjectObj?.color || '#6366f1' }}
              />
              <span>Proje İstatistikleri: <strong className="text-indigo-950 font-bold">{selectedProject}</strong></span>
              <span className="text-[11px] font-normal text-indigo-600 bg-white/80 px-1.5 py-0.2 rounded ml-1">
                {total} Görev
              </span>
              {onSelectProject && (
                <button
                  type="button"
                  onClick={() => onSelectProject(null)}
                  className="ml-1 p-0.5 hover:bg-indigo-200/60 rounded text-indigo-700 transition-colors"
                  title="Tüm projelere geri dön"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <FolderOpen className="w-4 h-4 text-gray-400" />
              <span>Tüm Projeler Genel Özeti</span>
              <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-semibold">
                {total} Toplam Görev
              </span>
            </div>
          )}
        </div>

        {/* Quick Project Switcher Dropdown */}
        {projects.length > 0 && onSelectProject && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 hidden sm:inline text-[11px]">Projeye Göre İncele:</span>
            <select
              value={selectedProject || 'all'}
              onChange={(e) => onSelectProject(e.target.value === 'all' ? null : e.target.value)}
              className="text-xs font-medium bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 shadow-2xs hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">Tüm Projeler ({tasks.length})</option>
              {projects.map((p) => {
                const pCount = tasks.filter(t => t.project === p.name).length;
                return (
                  <option key={p.id} value={p.name}>
                    {p.name} ({pCount})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* 4 Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam İşler */}
        <div 
          onClick={() => onFilterStatusClick && onFilterStatusClick('all')}
          className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              {selectedProject ? `${selectedProject} Toplam` : 'Toplam İşler'}
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">{total}</span>
            <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              <TrendingUp className="w-3 h-3" />
              {selectedProject ? 'Proje İşi' : 'Tüm İşler'}
            </span>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Aktif / Devam Eden */}
        <div 
          onClick={() => onFilterStatusClick && onFilterStatusClick('Aktif')}
          className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Aktif / Devam Eden</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">{active}</span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              %{activePct} {selectedProject ? 'Proje Yükü' : 'Genel Yük'}
            </span>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(activePct, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Tamamlandı / Bitti */}
        <div 
          onClick={() => onFilterStatusClick && onFilterStatusClick('Bitti')}
          className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Tamamlandı / Bitti</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">{completed}</span>
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              <CheckCheck className="w-3 h-3" />
              %{completedPct} Başarı
            </span>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(completedPct, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Beklemede & İnceleme */}
        <div 
          onClick={() => onFilterStatusClick && onFilterStatusClick('Beklemede')}
          className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Beklemede & İnceleme</span>
            <span className="p-1.5 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <PauseCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">{pending}</span>
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              %{pendingPct} Bekleyen
            </span>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gray-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(pendingPct, 100)}%` }}
            ></div>
          </div>
        </div>
      </section>
    </div>
  );
};
