import React from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { Task, getTaskAssignees } from '../types';
import { AssigneeAvatarGroup } from './AssigneeAvatarGroup';

interface TaskTimelineViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const TaskTimelineView: React.FC<TaskTimelineViewProps> = ({ tasks, onSelectTask }) => {
  const weeks = ['Eki Hafta 1', 'Eki Hafta 2', 'Eki Hafta 3', 'Eki Hafta 4', 'Kas Hafta 1', 'Kas Hafta 2'];

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Sprint & Teslimat Zaman Çizelgesi</h3>
          <p className="text-xs text-gray-500">Görevlerin planlanan başlangıç ve teslim süreleri</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
            <span>Mobil Uygulama</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span>Web Revizyonu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
            <span>Entegrasyonlar</span>
          </div>
        </div>
      </div>

      {/* Gantt Matrix */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 pb-2 border-b border-gray-100 uppercase tracking-wider">
            <div className="col-span-4">Görev & Sorumlu</div>
            <div className="col-span-8 grid grid-cols-6 text-center">
              {weeks.map((w, idx) => (
                <div key={idx} className="border-l border-gray-100 px-1 truncate">
                  {w}
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-gray-50 py-1">
            {tasks.map((task, idx) => {
              // Calculate a simulated timeline offset & span for visual representation
              const offsets = [1, 2, 0, 3, 1, 4, 2, 3];
              const spans = [3, 2, 4, 3, 2, 2, 4, 3];
              const colOffset = offsets[idx % offsets.length];
              const colSpan = spans[idx % spans.length];

              const projectColor = 
                task.project.includes('Mobil') ? 'bg-indigo-500 text-white' :
                task.project.includes('Web') ? 'bg-emerald-600 text-white' :
                'bg-amber-500 text-white';

              return (
                <div 
                  key={task.id} 
                  className="grid grid-cols-12 gap-2 py-2.5 items-center hover:bg-gray-50/80 transition-colors group cursor-pointer"
                  onClick={() => onSelectTask(task)}
                >
                  <div className="col-span-4 flex items-center gap-2 pr-2">
                    <AssigneeAvatarGroup assignees={getTaskAssignees(task)} showNames={false} size="sm" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate group-hover:text-indigo-600">
                        {task.title}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {task.code} • {task.startDate} - {task.dueDate}
                      </div>
                    </div>
                  </div>

                  {/* Visual Bar in 6 Columns */}
                  <div className="col-span-8 grid grid-cols-6 gap-1 relative h-6 items-center">
                    {/* Background grid lines */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-full border-l border-gray-100" />
                    ))}

                    <div
                      className={`absolute rounded-md h-5 px-2 flex items-center justify-between text-[10px] font-medium shadow-2xs ${projectColor} transition-all group-hover:brightness-110`}
                      style={{
                        left: `${(colOffset / 6) * 100}%`,
                        width: `${Math.min((colSpan / 6) * 100, 100 - (colOffset / 6) * 100)}%`
                      }}
                    >
                      <span className="truncate">{task.dueStatusNote || task.status}</span>
                      <span className="text-[9px] opacity-80 hidden sm:inline">{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
