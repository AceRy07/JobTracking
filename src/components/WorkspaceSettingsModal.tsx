import React from 'react';
import { X, Building2, Users, Folder, Trash2, Plus, Check } from 'lucide-react';
import { ASSIGNEES } from '../data/initialData';
import { Project } from '../types';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  onUpdateWorkspaceName: (name: string) => void;
  projects?: Project[];
  onDeleteProject?: (project: Project) => void;
  onOpenNewProject?: () => void;
}

export const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  isOpen,
  onClose,
  workspaceName,
  onUpdateWorkspaceName,
  projects = [],
  onDeleteProject,
  onOpenNewProject
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Çalışma Alanı Ayarları</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Name Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Çalışma Alanı Adı</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => onUpdateWorkspaceName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
          />
        </div>

        {/* Proje Yönetimi */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-indigo-600" />
              <span>Projeler ({projects.length})</span>
            </h4>
            {onOpenNewProject && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewProject();
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Proje</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
            {projects.map((proj) => (
              <div key={proj.id} className="flex items-center justify-between p-2.5 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-gray-900 block truncate">
                      {proj.name}
                    </span>
                    {proj.description && (
                      <span className="text-[11px] text-gray-400 block truncate">
                        {proj.description}
                      </span>
                    )}
                  </div>
                </div>

                {onDeleteProject && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDeleteProject(proj);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                    title={`"${proj.name}" projesini sil`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ekip Üyeleri */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Ekip Üyeleri ({ASSIGNEES.length})</span>
            </h4>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {ASSIGNEES.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <div className="text-xs font-semibold text-gray-900">{user.name}</div>
                    <div className="text-[11px] text-gray-500">{user.role}</div>
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Aktif
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div className="border-t border-gray-100 pt-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Bağlı Entegrasyonlar
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg border border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="font-medium text-gray-800">Slack Webhook</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Bağlı
              </span>
            </div>
            <div className="p-2.5 rounded-lg border border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="font-medium text-gray-800">HubSpot CRM</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Aktif
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
