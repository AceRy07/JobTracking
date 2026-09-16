import React from 'react';
import { X, BarChart3, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Task } from '../types';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  tasks
}) => {
  if (!isOpen) return null;

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Bitti' || t.completed).length;
  const active = tasks.filter(t => t.status === 'Aktif').length;
  const critical = tasks.filter(t => t.status === 'Kritik').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Raporlar ve Performans Analizi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
            <span className="text-[11px] text-indigo-700 font-semibold block uppercase">Sprint Tamamlanma</span>
            <span className="text-2xl font-bold text-indigo-900 mt-1 block">
              %{total > 0 ? Math.round((completed / total) * 100) : 0}
            </span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <span className="text-[11px] text-emerald-700 font-semibold block uppercase">Kapanan İşler</span>
            <span className="text-2xl font-bold text-emerald-900 mt-1 block">{completed} / {total}</span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
            <span className="text-[11px] text-amber-700 font-semibold block uppercase">Açık Yük</span>
            <span className="text-2xl font-bold text-amber-900 mt-1 block">{active + critical}</span>
          </div>
        </div>

        {/* Project Breakdown */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Projelere Göre Dağılım
          </h4>
          <div className="space-y-2 text-xs">
            {['Mobil Uygulama v2', 'Web Revizyonu', 'Entegrasyonlar'].map((proj) => {
              const count = tasks.filter(t => t.project === proj).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={proj} className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-1 font-medium text-gray-800">
                    <span>{proj}</span>
                    <span>{count} görev (%{pct})</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
