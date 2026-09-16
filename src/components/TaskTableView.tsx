import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Check, 
  Edit3, 
  Copy, 
  Trash2, 
  SearchX, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Task, getTaskAssignees } from '../types';
import { AssigneeAvatarGroup } from './AssigneeAvatarGroup';

interface TaskTableViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onResetFilters: () => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  onSelectTask,
  onResetFilters
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(tasks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTasks = tasks.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(currentTasks.map(t => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const allSelected = currentTasks.length > 0 && currentTasks.every(t => selectedTaskIds.includes(t.id));

  return (
    <section className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f1f3ff] text-gray-500 uppercase text-[11px] font-semibold tracking-wider select-none border-b border-gray-100">
              <th className="py-3 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600"
                />
              </th>
              <th className="py-3 px-4 min-w-[280px]">Madde Açıklama (Yapılan İş)</th>
              <th className="py-3 px-4 min-w-[260px]">Yapılacak İş</th>
              <th className="py-3 px-4 min-w-[130px]">Başlanacak Zaman</th>
              <th className="py-3 px-4 min-w-[170px]">Bitiş Süresi</th>
              <th className="py-3 px-4 min-w-[160px]">Sorumlu Kişi</th>
              <th className="py-3 px-4 min-w-[120px]">Son Durum</th>
              <th className="py-3 px-4 w-24 text-right pr-6">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-[#141b2b]">
            {currentTasks.map((task) => {
              const isChecked = task.completed || task.status === 'Bitti';
              const isRowSelected = selectedTaskIds.includes(task.id);

              return (
                <tr 
                  key={task.id}
                  className={`group hover:bg-[#f9f9ff] transition-colors ${
                    isRowSelected ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  {/* Select row checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleComplete(task.id)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600"
                      title={isChecked ? 'Yapılmadı olarak işaretle' : 'Tamamlandı olarak işaretle'}
                    />
                  </td>

                  {/* Title and Project */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <button
                        onClick={() => onSelectTask(task)}
                        className={`text-left font-semibold text-sm group-hover:text-indigo-600 transition-colors ${
                          isChecked ? 'line-through text-gray-400 font-normal' : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </button>
                      <span className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {task.code}
                        </span>
                        <span>{task.project}</span>
                      </span>
                    </div>
                  </td>

                  {/* Details */}
                  <td className="py-3.5 px-4">
                    <span 
                      onClick={() => onSelectTask(task)}
                      className={`line-clamp-2 cursor-pointer ${
                        isChecked ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {task.details}
                    </span>
                  </td>

                  {/* Start Date */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{task.startDate}</span>
                    </div>
                  </td>

                  {/* Due Date & Pill */}
                  <td className="py-3.5 px-4">
                    {isChecked ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{task.dueStatusNote || 'Tamamlandı'}</span>
                      </span>
                    ) : task.status === 'Kritik' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>{task.dueDate} ({task.dueStatusNote || 'Kritik'})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{task.dueDate} {task.dueStatusNote ? `(${task.dueStatusNote})` : ''}</span>
                      </span>
                    )}
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-4">
                    <AssigneeAvatarGroup assignees={getTaskAssignees(task)} />
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {task.status === 'Aktif' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Aktif
                      </span>
                    )}
                    {task.status === 'Bitti' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Bitti
                      </span>
                    )}
                    {task.status === 'Beklemede' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        Beklemede
                      </span>
                    )}
                    {task.status === 'Kritik' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        Kritik
                      </span>
                    )}
                  </td>

                  {/* Operations (Hover / Actions) */}
                  <td className="py-3.5 px-4 text-right pr-6">
                    <div className="opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1 transition-opacity">
                      <button
                        onClick={() => onSelectTask(task)}
                        className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        title="İncele"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDuplicateTask(task)}
                        className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Kopyala"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State Container */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h4 className="text-base text-gray-900 font-semibold">Eşleşen görev bulunamadı</h4>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            Arama kriterlerinizi değiştirebilir veya filtreleri sıfırlayabilirsiniz.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* Table Footer / Pagination */}
      {tasks.length > 0 && (
        <div className="bg-[#f1f3ff]/50 px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Toplam <span className="font-semibold text-gray-900">{tasks.length}</span> işten{' '}
            <span className="font-semibold text-gray-900">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, tasks.length)}
            </span>{' '}
            arası gösteriliyor
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Önceki</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1 disabled:opacity-40"
            >
              <span>Sonraki</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
