import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  Users, 
  Check 
} from 'lucide-react';
import { Assignee, Project, Task, TaskPriority, TaskStatus, getTaskAssignees } from '../types';
import { 
  toDateTimeLocalValue, 
  formatDateTimeDisplay, 
  calculateDueNote 
} from '../utils/dateUtils';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  projects: Project[];
  assignees: Assignee[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  projects,
  assignees
}) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [code, setCode] = useState('');
  const [project, setProject] = useState('');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [startDateTime, setStartDateTime] = useState('');
  const [dueDateTime, setDueDateTime] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Aktif');
  const [priority, setPriority] = useState<TaskPriority>('Orta');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDetails(task.details);
      setCode(task.code);
      setProject(task.project);
      
      const currentAssignees = getTaskAssignees(task);
      setSelectedAssigneeIds(currentAssignees.map(a => a.id));

      setStartDateTime(toDateTimeLocalValue(task.startDate));
      setDueDateTime(toDateTimeLocalValue(task.dueDate));
      setStatus(task.status);
      setPriority(task.priority || 'Orta');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleToggleAssignee = (id: string) => {
    setSelectedAssigneeIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

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
    const finalAssignees = selectedAssigneesList.length > 0 ? selectedAssigneesList : getTaskAssignees(task);

    const formattedStartDate = formatDateTimeDisplay(startDateTime, false);
    const formattedDueDate = formatDateTimeDisplay(dueDateTime, false);

    onUpdateTask({
      ...task,
      code,
      title: title.trim(),
      details: details.trim(),
      project,
      assignees: finalAssignees,
      assignee: finalAssignees[0],
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      dueStatusNote: calculatedDueNote || task.dueStatusNote,
      status,
      priority,
      completed: status === 'Bitti'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">Görevi Düzenle</h3>
            <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              {code}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Görev Kodu</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Proje</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Madde Açıklama (Başlık)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Yapılacak İş (Detay)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>

          {/* Sorumlu Kişiler (Çoklu) */}
          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-200/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-bold text-gray-800">
                  Sorumlu Kişiler ({selectedAssigneeIds.length} kişi)
                </label>
              </div>
            </div>

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
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-gray-200">
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

          {/* DateTime Picker */}
          <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-bold text-gray-800">
                  Tarih & Zaman (DateTime Seçici)
                </label>
              </div>
              {calculatedDueNote && (
                <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  {calculatedDueNote}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>Başlanacak Zaman</span>
                </label>
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>Bitiş Süresi</span>
                </label>
                <input
                  type="datetime-local"
                  value={dueDateTime}
                  onChange={(e) => setDueDateTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-500 bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-medium text-gray-500">Hızlı Bitiş:</span>
              <button
                type="button"
                onClick={() => handleQuickDueDate(0)}
                className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => handleQuickDueDate(3)}
                className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700"
              >
                +3 Gün
              </button>
              <button
                type="button"
                onClick={() => handleQuickDueDate(7)}
                className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700"
              >
                +1 Hafta
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Durum</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white"
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
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white"
              >
                <option value="Düşük">Düşük</option>
                <option value="Orta">Orta</option>
                <option value="Yüksek">Yüksek</option>
                <option value="Kritik">Kritik</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
