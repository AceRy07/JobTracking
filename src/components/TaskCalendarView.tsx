import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Task } from '../types';

interface TaskCalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ tasks, onSelectTask }) => {
  const [currentMonth, setCurrentMonth] = useState('Ekim 2024');

  // Days of current month (1 to 31 for October)
  const daysInMonth = 31;
  const startDayOffset = 1; // Starts on Tuesday for Oct 2024
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 flex flex-col gap-4">
      {/* Month Header & Controls */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-semibold text-gray-900">{currentMonth}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setCurrentMonth('Eylül 2024')}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setCurrentMonth('Ekim 2024')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            Bugün
          </button>
          <button 
            onClick={() => setCurrentMonth('Kasım 2024')}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
        {/* Weekday headers */}
        {weekDays.map((day) => (
          <div key={day} className="bg-[#f1f3ff] py-2 text-center text-xs font-semibold text-gray-600">
            {day}
          </div>
        ))}

        {/* Empty cells before month starts */}
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50/50 min-h-[90px] p-1.5 text-gray-300 text-xs"></div>
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
          
          // Match tasks that have due date in this day (e.g. "18 Eki 2024" or "24 Eki 2024")
          const dayTasks = tasks.filter(t => t.dueDate.includes(`${dayStr} Eki`) || t.dueDate.includes(`${dayNum} Eki`));
          const isToday = dayNum === 18;

          return (
            <div
              key={dayNum}
              className={`bg-white min-h-[95px] p-1.5 flex flex-col justify-between hover:bg-indigo-50/20 transition-colors ${
                isToday ? 'ring-2 ring-indigo-500 ring-inset' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                  }`}
                >
                  {dayNum}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] text-gray-400 font-medium">{dayTasks.length} iş</span>
                )}
              </div>

              {/* Task Chips */}
              <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[60px]">
                {dayTasks.slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium cursor-pointer transition-transform hover:scale-[1.02] ${
                      t.status === 'Bitti'
                        ? 'bg-emerald-100 text-emerald-800 line-through'
                        : t.status === 'Kritik'
                        ? 'bg-red-100 text-red-800 font-semibold'
                        : 'bg-indigo-50 text-indigo-800'
                    }`}
                    title={t.title}
                  >
                    {t.code}: {t.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <span className="text-[9px] text-gray-400 pl-1">+{dayTasks.length - 2} daha...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
