import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Folder, AlertCircle } from 'lucide-react';
import { Project } from '../types';

interface DeleteProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  taskCount: number;
  onConfirmDelete: (projectId: string, deleteTasks: boolean) => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  taskCount,
  onConfirmDelete
}) => {
  const [deleteTasks, setDeleteTasks] = useState(false);

  if (!isOpen || !project) return null;

  const handleConfirm = () => {
    onConfirmDelete(project.id, deleteTasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-2xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Projeyi Sil</h3>
              <p className="text-xs text-gray-500">Bu işlem projeyi sistemden kaldıracaktır</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Info Card */}
        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white"
              style={{ backgroundColor: project.color }}
            />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-gray-900 block truncate">
                {project.name}
              </span>
              <span className="text-[11px] text-gray-500">
                {taskCount > 0 ? `${taskCount} adet görev bağlı` : 'Henüz bağlı görev yok'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-gray-500 border border-gray-200">
            {project.id}
          </span>
        </div>

        {/* Warning & Task handling option */}
        {taskCount > 0 ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <p className="leading-relaxed">
                Bu projeye ait <strong>{taskCount} adet görev</strong> bulunmaktadır. Projeyi sildiğinizde bu görevlerin nasıl işleneceğini seçebilirsiniz:
              </p>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={deleteTasks}
                onChange={(e) => setDeleteTasks(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-gray-900 block">
                  Bağlı {taskCount} görevi de kalıcı olarak sil
                </span>
                <span className="text-gray-500 text-[11px]">
                  İşaretlenmezse görevler silinmez, projesi "Genel / Projesiz" olarak güncellenir.
                </span>
              </div>
            </label>
          </div>
        ) : (
          <p className="text-xs text-gray-600">
            <strong>"{project.name}"</strong> projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Projeyi Sil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
