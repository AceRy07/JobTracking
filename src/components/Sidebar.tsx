import React from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar, 
  GanttChart, 
  Plus, 
  BarChart3, 
  Settings,
  FolderOpen,
  Trash2
} from 'lucide-react';
import { ActiveView, Project } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedProject: string | null;
  setSelectedProject: (proj: string | null) => void;
  projects: Project[];
  projectCounts: Record<string, number>;
  onOpenNewProject: () => void;
  onOpenReports: () => void;
  onOpenSettings: () => void;
  onDeleteProject?: (project: Project) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  selectedProject,
  setSelectedProject,
  projects,
  projectCounts,
  onOpenNewProject,
  onOpenReports,
  onOpenSettings,
  onDeleteProject
}) => {
  return (
    <aside className="w-64 bg-white border-r border-[#e5e7eb] flex flex-col justify-between py-4 shrink-0 select-none min-h-[calc(100vh-4rem)]">
      <div className="px-3 flex flex-col gap-6">
        {/* GÖRÜNÜMLER SECTION */}
        <div className="flex flex-col gap-1">
          <span className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Görünümler
          </span>
          <nav className="flex flex-col gap-0.5 mt-1">
            <button
              onClick={() => setActiveView('pano')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                activeView === 'pano'
                  ? 'bg-indigo-50 text-indigo-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeView === 'pano' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span>İş Panosu</span>
            </button>

            <button
              onClick={() => setActiveView('tablo')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                activeView === 'tablo'
                  ? 'bg-indigo-50 text-indigo-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ListTodo className={`w-4 h-4 ${activeView === 'tablo' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span>Tüm Görevler</span>
            </button>

            <button
              onClick={() => setActiveView('takvim')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                activeView === 'takvim'
                  ? 'bg-indigo-50 text-indigo-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeView === 'takvim' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span>Takvim</span>
            </button>

            <button
              onClick={() => setActiveView('cizelge')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                activeView === 'cizelge'
                  ? 'bg-indigo-50 text-indigo-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <GanttChart className={`w-4 h-4 ${activeView === 'cizelge' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span>Zaman Planı</span>
            </button>
          </nav>
        </div>

        {/* PROJELER SECTION */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Projeler
            </span>
            <button
              onClick={onOpenNewProject}
              className="p-0.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
              title="Yeni Proje Ekle"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex flex-col gap-0.5 mt-1">
            <button
              onClick={() => setSelectedProject(null)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedProject === null
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-gray-500" />
                <span>Tüm Projeler</span>
              </span>
              <span className="text-[11px] font-medium text-gray-400">
                {Object.values(projectCounts).reduce((a: number, b: number) => a + b, 0)}
              </span>
            </button>

            {projects.map((proj) => {
              const isSelected = selectedProject === proj.name;
              return (
                <div
                  key={proj.id}
                  className={`group/proj relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedProject(isSelected ? null : proj.name)}
                    className="flex items-center gap-2 truncate flex-1 text-left min-w-0 py-0.5"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0 ml-1.5">
                    <span className="text-[11px] font-semibold text-gray-500 px-1.5 py-0.5 bg-gray-100/90 rounded-md">
                      {projectCounts[proj.name] || 0}
                    </span>
                    {onDeleteProject && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(proj);
                        }}
                        className="opacity-0 group-hover/proj:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all focus:opacity-100"
                        title={`"${proj.name}" projesini sil`}
                        aria-label={`"${proj.name}" projesini sil`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="px-3 pt-3 border-t border-gray-100 flex flex-col gap-0.5">
        <button
          onClick={onOpenReports}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
        >
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <span>Raporlar & Analiz</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          <span>Çalışma Alanı Ayarları</span>
        </button>
      </div>
    </aside>
  );
};
