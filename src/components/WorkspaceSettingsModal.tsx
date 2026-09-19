import React, { useState } from 'react';
import { X, Building2, Users, Folder, Trash2, Plus, Check, Pencil } from 'lucide-react';
import { Assignee, Project } from '../types';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  onUpdateWorkspaceName: (name: string) => void;
  projects?: Project[];
  teamMembers?: Assignee[];
  onDeleteProject?: (project: Project) => void;
  onOpenNewProject?: () => void;
  onAddTeamMember?: (member: Assignee) => void;
  onUpdateTeamMember?: (memberId: string, name: string, role: string) => void;
  onDeleteTeamMember?: (memberId: string) => void;
}

export const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  isOpen,
  onClose,
  workspaceName,
  onUpdateWorkspaceName,
  projects = [],
  teamMembers = [],
  onDeleteProject,
  onOpenNewProject,
  onAddTeamMember,
  onUpdateTeamMember,
  onDeleteTeamMember
}) => {
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberName, setEditingMemberName] = useState('');
  const [editingMemberRole, setEditingMemberRole] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = memberName.trim();
    if (!trimmedName || !onAddTeamMember) return;

    const initials = trimmedName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('') || 'U';

    onAddTeamMember({
      id: `member-${Date.now()}`,
      name: trimmedName,
      role: memberRole.trim() || 'Üye',
      initials,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-indigo-100',
      badgeColor: 'text-indigo-800'
    });

    setMemberName('');
    setMemberRole('');
  };

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
              <span>Ekip Üyeleri ({teamMembers.length})</span>
            </h4>
          </div>

          <form onSubmit={handleAddMember} className="mb-3 flex gap-2">
            <input
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Yeni ekip üyesi adı"
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              placeholder="Rol"
              className="w-28 px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!memberName.trim() || !onAddTeamMember}
              className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-lg"
            >
              Ekle
            </button>
          </form>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {teamMembers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50">
                {editingMemberId === user.id ? (
                  <form
                    className="flex flex-1 items-center gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      onUpdateTeamMember?.(user.id, editingMemberName, editingMemberRole);
                      setEditingMemberId(null);
                    }}
                  >
                    <input value={editingMemberName} onChange={(event) => setEditingMemberName(event.target.value)} className="min-w-0 flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500" aria-label="Ekip üyesi adı" />
                    <input value={editingMemberRole} onChange={(event) => setEditingMemberRole(event.target.value)} className="w-24 px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500" aria-label="Ekip üyesi rolü" />
                    <button type="submit" className="text-xs font-semibold text-indigo-600">Kaydet</button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">{user.name}</div>
                        <div className="text-[11px] text-gray-500 truncate">{user.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button type="button" onClick={() => { setEditingMemberId(user.id); setEditingMemberName(user.name); setEditingMemberRole(user.role); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Ekip üyesini düzenle">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => onDeleteTeamMember?.(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Ekip üyesini kaldır">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
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
