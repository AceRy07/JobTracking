import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Folder, 
  Tag, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Assignee, Project, Task, TaskPriority, TaskStatus } from '../types';
import { 
  toDateTimeLocalValue, 
  formatDateTimeDisplay, 
  calculateDueNote 
} from '../utils/dateUtils';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  projects: Project[];
  assignees: Assignee[];
  defaultProject?: string | null;
  onOpenNewProjectModal?: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  projects,
  assignees,
  defaultProject,
  onOpenNewProjectModal
}) => {
  // Default dates for datetime-local
  const getDefaultStartDate = () => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return toDateTimeLocalValue(d.toISOString());
  };

  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(18, 0, 0, 0);
    return toDateTimeLocalValue(d.toISOString());
  };

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [code, setCode] = useState(`TASK-${Math.floor(100 + Math.random() * 900)}`);
  const [project, setProject] = useState(projects[0]?.name || 'Mobil Uygulama v2');
  
  // Multi-assignee state
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([assignees[0]?.id || 'arda']);

  // Sync project & reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultProject && projects.some(p => p.name.trim().toLowerCase() === defaultProject.trim().toLowerCase())) {
        const matching = projects.find(p => p.name.trim().toLowerCase() === defaultProject.trim().toLowerCase());
        setProject(matching ? matching.name : defaultProject);
      } else if (projects.length > 0) {
        setProject(projects[0].name);
      }

      if (assignees.length > 0) {
        setSelectedAssigneeIds([assignees[0].id]);
      }
      setCode(`TASK-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [isOpen, defaultProject, projects, assignees]);

  // DateTime states
  const [startDateTime, setStartDateTime] = useState<string>(getDefaultStartDate);
  const [dueDateTime, setDueDateTime] = useState<string>(getDefaultDueDate);

  const [status, setStatus] = useState<TaskStatus>('Aktif');
  const [priority, setPriority] = useState<TaskPriority>('Orta');
  const [category, setCategory] = useState('Genel');

  if (!isOpen) return null;

  // Toggle assignee selection
  const handleToggleAssignee = (id: string) => {
    setSelectedAssigneeIds(prev => {
      if (prev.includes(id)) {
        // Keep at least 1 assignee selected for clarity
        if (prev.length === 1) return prev;
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllAssignees = () => {
    setSelectedAssigneeIds(assignees.map(a => a.id));
  };

  // Quick DateTime helpers
  const handleQuickDueDate = (daysToAdd: number) => {
    const base = new Date();
    base.setDate(base.getDate() + daysToAdd);
    base.setHours(18, 0, 0, 0);
    setDueDateTime(toDateTimeLocalValue(base.toISOString()));
  };

  const calculatedDueNote = calculateDueNote(dueDateTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedAssigneesList = assignees.filter(a => selectedAssigneeIds.includes(a.id));
    const finalAssignees = selectedAssigneesList.length > 0 ? selectedAssigneesList : [assignees[0]];

    const formattedStartDate = formatDateTimeDisplay(startDateTime, false);
    const formattedDueDate = formatDateTimeDisplay(dueDateTime, false);

    onSaveTask({
      code,
      title: title.trim(),
      details: details.trim() || 'Açıklama belirtilmedi.',
      project,
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      dueStatusNote: calculatedDueNote || 'Planlandı',
      status,
      assignees: finalAssignees,
      assignee: finalAssignees[0], // fallback for backwards compatibility
      priority,
      category,
      completed: status === 'Bitti',
      commentsCount: 0
    });

    // Reset and close
    setTitle('');
    setDetails('');
    onClose();
  };

  const selectedCount = selectedAssigneeIds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Yeni İş Ekle</h3>
              <p className="text-xs text-gray-500">Panoya yeni görev ve çoklu sorumluluk kaydı açın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Görev Kodu ve Proje */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Görev Kodu</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500 font-mono bg-gray-50/50"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">Proje</label>
                {onOpenNewProjectModal && (
                  <button
                    type="button"
                    onClick={onOpenNewProjectModal}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Yeni Proje</span>
                  </button>
                )}
              </div>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: projects.find(p => p.name === project)?.color || '#6366f1' }}
                />
                <span>Bu iş hem <strong>{project}</strong> hem de <strong>Tüm Projeler</strong> panosunda görünecektir.</span>
              </div>
            </div>
          </div>

          {/* Başlık */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Madde Açıklama (Yapılan İş Başlığı) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Kullanıcı Kayıt Akışı Yenilemesi"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
              autoFocus
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Yapılacak İş (Açıklama / Kapsam)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              placeholder="Örn: OAuth2 ve Google Girişi entegrasyonu tamamlanacak..."
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>

          {/* ÇOKLU SORUMLU SEÇİMİ (1 den fazla seçilebilir) */}
          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-200/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-bold text-gray-800">
                  Sorumlu Kişiler ({selectedCount} kişi seçili)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllAssignees}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Tümünü Seç
                </button>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedAssigneeIds([assignees[0]?.id || 'selin'])}
                  className="text-[11px] font-medium text-gray-500 hover:text-gray-700"
                >
                  Sıfırla
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-500">
              Bu göreve 1 veya daha fazla ekip üyesini ortak sorumlu olarak atayabilirsiniz.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {assignees.map((a) => {
                const isChecked = selectedAssigneeIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleToggleAssignee(a.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                      isChecked
                        ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400 text-indigo-950'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-gray-200">
                        {a.avatarUrl ? (
                          <img src={a.avatarUrl} alt={a.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-indigo-700 flex items-center justify-center h-full bg-indigo-100">
                            {a.initials}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate leading-tight">{a.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{a.role}</div>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ml-1.5 transition-colors ${
                      isChecked ? 'bg-indigo-600 text-white' : 'border border-gray-300'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TARİH SÜRELERİ (DateTime ile seçilebilir, elle yazılmaz) */}
          <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-bold text-gray-800">
                  Tarih & Zaman Belirleme (DateTime Seçici)
                </label>
              </div>
              {calculatedDueNote && (
                <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                  {calculatedDueNote}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Başlanacak Zaman */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>Başlanacak Zaman</span>
                </label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-2xs font-sans"
                  required
                />
              </div>

              {/* Bitiş Süresi */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>Bitiş Süresi (Teslim)</span>
                </label>
                <input
                  type="datetime-local"
                  value={dueDateTime}
                  onChange={(e) => setDueDateTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-2xs font-sans"
                  required
                />
              </div>
            </div>

            {/* Quick Presets for DateTime */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-medium text-gray-500">Hızlı Bitiş:</span>
              <button
                type="button"
                onClick={() => handleQuickDueDate(0)}
                className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700 transition-colors"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => handleQuickDueDate(3)}
                className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700 transition-colors"
              >
                +3 Gün
              </button>
              <button
                type="button"
                onClick={() => handleQuickDueDate(7)}
                className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700 transition-colors"
              >
                +1 Hafta
              </button>
              <button
                type="button"
                onClick={() => handleQuickDueDate(14)}
                className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700 transition-colors"
              >
                +2 Hafta
              </button>
              <button
                type="button"
                onClick={() => handleQuickDueDate(30)}
                className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700 transition-colors"
              >
                +1 Ay
              </button>
            </div>
          </div>

          {/* Durum & Öncelik */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Başlangıç Durumu</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Bitti">Bitti</option>
                <option value="Beklemede">Beklemede</option>
                <option value="Kritik">Kritik</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Öncelik</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
              >
                <option value="Düşük">Düşük</option>
                <option value="Orta">Orta</option>
                <option value="Yüksek">Yüksek</option>
                <option value="Kritik">Kritik</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Görevi Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
