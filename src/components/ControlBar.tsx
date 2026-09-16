import React, { useState } from 'react';
import { 
  Search, 
  User, 
  ChevronDown, 
  SlidersHorizontal, 
  Calendar as CalendarIcon, 
  Table as TableIcon, 
  Kanban as KanbanIcon, 
  GanttChart as GanttChartIcon, 
  Download,
  Check,
  Loader2
} from 'lucide-react';
import { ActiveView, Assignee } from '../types';

interface ControlBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedAssignee: string;
  onAssigneeChange: (a: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  dateRangeFilter: string;
  onDateRangeChange: (d: string) => void;
  activeView: ActiveView;
  onViewChange: (v: ActiveView) => void;
  assignees: Assignee[];
  onExportCsv: () => void;
  isExporting: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedAssignee,
  onAssigneeChange,
  selectedStatus,
  onStatusChange,
  dateRangeFilter,
  onDateRangeChange,
  activeView,
  onViewChange,
  assignees,
  onExportCsv,
  isExporting
}) => {
  const [showDateMenu, setShowDateMenu] = useState(false);

  const dateOptions = [
    { label: 'Tüm Tarihler', value: 'all' },
    { label: 'Bu Hafta', value: 'this-week' },
    { label: 'Önümüzdeki Hafta', value: 'next-week' },
    { label: 'Bu Ay', value: 'this-month' }
  ];

  return (
    <section className="bg-white rounded-xl p-3 shadow-xs border border-gray-100 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
      {/* Left Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1">
        {/* Search Input */}
        <div className="relative flex items-center bg-[#f1f3ff] rounded-lg px-3 py-1.5 flex-1 min-w-[220px] max-w-md focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 border border-transparent focus-within:border-indigo-500 transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Görevlerde veya sorumlularda ara..."
            className="bg-transparent text-gray-800 text-xs sm:text-sm w-full outline-none placeholder:text-gray-400"
          />
          <kbd className="text-[10px] font-semibold bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded shadow-2xs select-none">
            ⌘K
          </kbd>
        </div>

        {/* Sorumlu Filter */}
        <div className="relative">
          <select
            value={selectedAssignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="appearance-none bg-[#f1f3ff] hover:bg-indigo-50 text-gray-800 text-xs sm:text-sm font-medium py-1.5 pl-8 pr-8 rounded-lg cursor-pointer outline-none transition-colors border border-transparent hover:border-indigo-100"
          >
            <option value="all">Sorumlu: Tüm Ekip</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          <User className="w-4 h-4 text-gray-500 absolute left-2.5 top-2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Durum Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-[#f1f3ff] hover:bg-indigo-50 text-gray-800 text-xs sm:text-sm font-medium py-1.5 pl-8 pr-8 rounded-lg cursor-pointer outline-none transition-colors border border-transparent hover:border-indigo-100"
          >
            <option value="all">Durum: Tümü</option>
            <option value="Aktif">Aktif</option>
            <option value="Bitti">Bitti</option>
            <option value="Beklemede">Beklemede</option>
            <option value="Kritik">Kritik</option>
          </select>
          <SlidersHorizontal className="w-4 h-4 text-gray-500 absolute left-2.5 top-2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Tarih Aralığı Filter */}
        <div className="relative">
          <button
            onClick={() => setShowDateMenu(!showDateMenu)}
            className="flex items-center gap-1.5 bg-[#f1f3ff] hover:bg-indigo-50 text-gray-800 text-xs sm:text-sm font-medium py-1.5 px-3 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
          >
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <span>
              {dateRangeFilter === 'all'
                ? 'Tarih Aralığı'
                : dateOptions.find((d) => d.value === dateRangeFilter)?.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showDateMenu && (
            <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
              {dateOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onDateRangeChange(opt.value);
                    setShowDateMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-50"
                >
                  <span>{opt.label}</span>
                  {dateRangeFilter === opt.value && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Views & Export */}
      <div className="flex items-center justify-between xl:justify-end gap-2.5 pt-2 xl:pt-0">
        {/* Segmented View Switcher */}
        <div className="flex items-center bg-[#f1f3ff] p-0.5 rounded-lg border border-gray-100">
          <button
            onClick={() => onViewChange('tablo')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activeView === 'tablo'
                ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TableIcon className={`w-3.5 h-3.5 ${activeView === 'tablo' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span>Tablo</span>
          </button>
          <button
            onClick={() => onViewChange('pano')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activeView === 'pano'
                ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <KanbanIcon className={`w-3.5 h-3.5 ${activeView === 'pano' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span>Pano</span>
          </button>
          <button
            onClick={() => onViewChange('cizelge')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              activeView === 'cizelge'
                ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <GanttChartIcon className={`w-3.5 h-3.5 ${activeView === 'cizelge' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span>Çizelge</span>
          </button>
        </div>

        {/* Export Button */}
        <button
          onClick={onExportCsv}
          disabled={isExporting}
          className="flex items-center gap-1.5 bg-[#f1f3ff] hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-medium py-1.5 px-3 rounded-lg shadow-2xs transition-colors"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>İndiriliyor...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">Dışa Aktar</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
