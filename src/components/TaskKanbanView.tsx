import React from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MoreVertical, 
  AlertTriangle,
  Check,
  Edit3
} from 'lucide-react';
import { Task, TaskStatus, getTaskAssignees } from '../types';
import { AssigneeAvatarGroup } from './AssigneeAvatarGroup';

interface TaskKanbanViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
}

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onToggleComplete,
  onUpdateStatus,
  onSelectTask,
  onOpenNewTask,
  onEditTask
}) => {
  const columns: { id: TaskStatus; title: string; color: string; badgeBg: string; textColor: string }[] = [
    { id: 'Aktif', title: 'Aktif / Devam Eden', color: 'border-amber-500', badgeBg: 'bg-amber-50', textColor: 'text-amber-800' },
    { id: 'Bitti', title: 'Tamamlandı / Bitti', color: 'border-emerald-500', badgeBg: 'bg-emerald-50', textColor: 'text-emerald-800' },
    { id: 'Beklemede', title: 'Beklemede & İnceleme', color: 'border-gray-400', badgeBg: 'bg-gray-100', textColor: 'text-gray-700' },
    { id: 'Kritik', title: 'Kritik / Öncelikli', color: 'border-red-500', badgeBg: 'bg-red-50', textColor: 'text-red-800' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="bg-[#f1f3ff]/60 rounded-xl p-3 flex flex-col min-h-[500px] border border-gray-200/50"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 py-1.5 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.badgeBg} border ${col.color}`} />
                <h3 className="font-semibold text-xs text-gray-800 uppercase tracking-wider">
                  {col.title}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-gray-600 shadow-2xs">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={onOpenNewTask}
                className="p-1 rounded hover:bg-white text-gray-400 hover:text-indigo-600 transition-colors"
                title="Yeni Görev Ekle"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards List */}
            <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-0.5">
              {colTasks.map((task) => {
                const isDone = task.status === 'Bitti' || task.completed;

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all flex flex-col justify-between group relative"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {task.code}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 truncate max-w-[120px]">
                          {task.project}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditTask(task)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                          title="Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleComplete(task.id)}
                          className={`p-1 rounded transition-colors ${
                            isDone 
                              ? 'text-emerald-600 bg-emerald-50' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={isDone ? 'Geri al' : 'Tamamla'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => onSelectTask(task)}
                      className={`font-semibold text-sm cursor-pointer hover:text-indigo-600 transition-colors leading-snug ${
                        isDone ? 'line-through text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {/* Details Snippet */}
                    <p 
                      onClick={() => onSelectTask(task)}
                      className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed cursor-pointer"
                    >
                      {task.details}
                    </p>

                    {/* Footer Metadata */}
                    <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[11px]">{task.dueDate}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status switcher selector */}
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                          className="text-[10px] font-medium bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 outline-none cursor-pointer hover:bg-white"
                          title="Durumu Hızlı Değiştir"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Bitti">Bitti</option>
                          <option value="Beklemede">Beklemede</option>
                          <option value="Kritik">Kritik</option>
                        </select>

                        {/* Assignee Avatar Group */}
                        <AssigneeAvatarGroup assignees={getTaskAssignees(task)} showNames={false} size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 px-2 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  <span className="text-xs text-gray-400">Bu sütunda görev yok</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
