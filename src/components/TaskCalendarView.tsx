import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface TaskCalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const MONTH_LOOKUP: { [key: string]: number } = {
  'ocak': 0, 'ock': 0, 'oc': 0,
  'şubat': 1, 'subat': 1, 'şub': 1, 'sub': 1,
  'mart': 2, 'mrt': 2, 'mar': 2,
  'nisan': 3, 'nis': 3,
  'mayıs': 4, 'mayis': 4, 'may': 4,
  'haziran': 5, 'haz': 5,
  'temmuz': 6, 'tem': 6,
  'ağustos': 7, 'agustos': 7, 'ağu': 7, 'agu': 7,
  'eylül': 8, 'eylul': 8, 'eyl': 8,
  'ekim': 9, 'eki': 9,
  'kasım': 10, 'kasim': 10, 'kas': 10,
  'aralık': 11, 'aralik': 11, 'ara': 11
};

/**
 * Parses a date string into a Date object or { year, month, day }
 */
function parseDateComponents(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;

  // 1. Try ISO or standard parse
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth(),
      day: parsed.getDate()
    };
  }

  // 2. Try Turkish text format e.g. "24 Eki 2024", "16 Eyl 2026 14:00", "08 Eki"
  const clean = dateStr.trim().toLowerCase();
  const match = clean.match(/(\d{1,2})\s+([a-zçğıöşü]+)(?:\s+(\d{4}))?/);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthKey = match[2];
    const month = MONTH_LOOKUP[monthKey];
    const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();

    if (month !== undefined && !isNaN(day)) {
      return { year, month, day };
    }
  }

  return null;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ tasks, onSelectTask }) => {
  // Current view date (year & month)
  const [viewDate, setViewDate] = useState(() => {
    // If there are tasks, default to current date or most recent task date
    return new Date();
  });

  const currentYear = viewDate.getFullYear();
  const currentMonthIndex = viewDate.getMonth();
  const monthTitle = `${TURKISH_MONTHS[currentMonthIndex]} ${currentYear}`;

  const today = new Date();
  const isViewingCurrentMonth = 
    today.getFullYear() === currentYear && today.getMonth() === currentMonthIndex;

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  // Start day of week (Monday as index 0)
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();
  // In JS: 0=Sun, 1=Mon, ..., 6=Sat. Convert to Mon=0 ... Sun=6
  const startDayOffset = (firstDayOfWeek + 6) % 7;

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    setViewDate(new Date());
  };

  // Find tasks matching specific day in this month
  const getTasksForDay = (dayNum: number) => {
    return tasks.filter(t => {
      // Check due date
      const due = parseDateComponents(t.dueDate);
      if (due && due.year === currentYear && due.month === currentMonthIndex && due.day === dayNum) {
        return true;
      }
      // Or check start date if due date doesn't match
      const start = parseDateComponents(t.startDate);
      if (start && start.year === currentYear && start.month === currentMonthIndex && start.day === dayNum) {
        return true;
      }
      return false;
    });
  };

  // Total tasks in this viewed month
  const monthTasksCount = tasks.filter(t => {
    const due = parseDateComponents(t.dueDate);
    if (due && due.year === currentYear && due.month === currentMonthIndex) return true;
    const start = parseDateComponents(t.startDate);
    if (start && start.year === currentYear && start.month === currentMonthIndex) return true;
    return false;
  }).length;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 flex flex-col gap-4">
      {/* Month Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">{monthTitle}</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {monthTasksCount} iş planlandı
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Tüm teslim tarihleri ve zamanlamalar takvim üzerinde senkronize edilir</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1 text-xs font-medium"
            title="Önceki Ay"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline">Önceki</span>
          </button>
          <button 
            onClick={handleGoToday}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
              isViewingCurrentMonth
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Bugün</span>
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1 text-xs font-medium"
            title="Sonraki Ay"
          >
            <span className="hidden md:inline">Sonraki</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200 shadow-xs">
        {/* Weekday headers */}
        {weekDays.map((day, idx) => (
          <div 
            key={day} 
            className={`py-2 text-center text-xs font-bold ${
              idx >= 5 ? 'bg-indigo-50/60 text-indigo-800' : 'bg-[#f1f3ff] text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}

        {/* Empty cells before month starts */}
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50/40 min-h-[95px] p-1.5 text-gray-300 text-xs select-none"></div>
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayTasks = getTasksForDay(dayNum);
          
          const isToday = 
            isViewingCurrentMonth && dayNum === today.getDate();

          return (
            <div
              key={dayNum}
              className={`bg-white min-h-[95px] sm:min-h-[105px] p-1.5 flex flex-col justify-between hover:bg-indigo-50/20 transition-colors ${
                isToday ? 'ring-2 ring-indigo-600 ring-inset bg-indigo-50/10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                    isToday 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {dayNum}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {dayTasks.length} iş
                  </span>
                )}
              </div>

              {/* Task Chips */}
              <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[65px] no-scrollbar">
                {dayTasks.slice(0, 3).map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className={`text-left px-1.5 py-0.5 rounded text-[10px] truncate font-medium transition-all hover:opacity-90 hover:scale-[1.01] flex items-center gap-1 ${
                      t.status === 'Bitti' || t.completed
                        ? 'bg-emerald-100 text-emerald-800 line-through opacity-80'
                        : t.status === 'Kritik'
                        ? 'bg-red-100 text-red-800 font-semibold border border-red-200'
                        : t.status === 'Beklemede'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                    }`}
                    title={`${t.code}: ${t.title} (${t.project})`}
                  >
                    <span className="font-bold shrink-0">{t.code}</span>
                    <span className="truncate">{t.title}</span>
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[9px] font-medium text-gray-500 pl-1">
                    +{dayTasks.length - 3} daha...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
