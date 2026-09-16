import React, { useState } from 'react';
import { 
  Users, 
  ArrowRight, 
  Lightbulb, 
  Keyboard, 
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Task } from '../types';

interface ProductivityWidgetsProps {
  tasks: Task[];
  onOpenShortcuts: () => void;
  onOpenResourcePlan: () => void;
}

export const ProductivityWidgets: React.FC<ProductivityWidgetsProps> = ({
  tasks,
  onOpenShortcuts,
  onOpenResourcePlan
}) => {
  const selinTasks = tasks.filter(t => t.assignee.name === 'Selin Yılmaz' && t.status !== 'Bitti').length;
  const canerTasks = tasks.filter(t => t.assignee.name === 'Caner Tekin' && t.status !== 'Bitti').length;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Productivity Mini-Widget */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Haftalık Tamamlama Hızı</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +18% Verim
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Ekip sprint hedeflerinin %82'sini planlanan süreden önce bitirdi.
          </p>
        </div>

        <div className="mt-4 flex items-end gap-2.5 h-16 pt-2">
          <div className="flex-1 bg-gray-100 rounded-t-md flex flex-col justify-end items-center h-full group">
            <div className="w-full bg-indigo-200 group-hover:bg-indigo-300 rounded-t-md h-[40%] transition-all"></div>
            <span className="text-[10px] text-gray-500 mt-1">Pzt</span>
          </div>
          <div className="flex-1 bg-gray-100 rounded-t-md flex flex-col justify-end items-center h-full group">
            <div className="w-full bg-indigo-300 group-hover:bg-indigo-400 rounded-t-md h-[65%] transition-all"></div>
            <span className="text-[10px] text-gray-500 mt-1">Sal</span>
          </div>
          <div className="flex-1 bg-gray-100 rounded-t-md flex flex-col justify-end items-center h-full group">
            <div className="w-full bg-indigo-400 group-hover:bg-indigo-500 rounded-t-md h-[80%] transition-all"></div>
            <span className="text-[10px] text-gray-500 mt-1">Çar</span>
          </div>
          <div className="flex-1 bg-gray-100 rounded-t-md flex flex-col justify-end items-center h-full group">
            <div className="w-full bg-indigo-600 rounded-t-md h-[95%] shadow-xs"></div>
            <span className="text-[10px] text-indigo-900 font-bold mt-1">Per</span>
          </div>
          <div className="flex-1 bg-gray-100 rounded-t-md flex flex-col justify-end items-center h-full group">
            <div className="w-full bg-indigo-300 group-hover:bg-indigo-400 rounded-t-md h-[55%] transition-all"></div>
            <span className="text-[10px] text-gray-500 mt-1">Cum</span>
          </div>
        </div>
      </div>

      {/* Active Collaborator Pulse */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Aktif İş Dağılımı</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-800 font-medium">Selin Yılmaz (Ürün)</span>
                <span className="text-gray-500 font-semibold">{selinTasks} görev</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(selinTasks * 15, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-800 font-medium">Caner Tekin (Arka Uç)</span>
                <span className="text-gray-500 font-semibold">{canerTasks} görev</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(canerTasks * 18, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button 
            onClick={onOpenResourcePlan}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 transition-colors"
          >
            <span>Tüm kaynak planı</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Note / Notification Banner */}
      <div className="bg-[#f1f3ff] rounded-xl p-4 shadow-xs border border-indigo-100/60 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white text-indigo-600 shadow-2xs shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Hızlı İpucu</h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Satırlardaki <kbd className="text-[11px] font-semibold bg-white px-1.5 py-0.5 rounded shadow-2xs border border-gray-200">Boşluk</kbd> tuşuna basarak görev detay modunu anında önizleyebilirsiniz.
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-indigo-100/50">
          <span className="text-[11px] text-gray-500">Otomatik senkronizasyon açık</span>
          <button
            onClick={onOpenShortcuts}
            className="px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium rounded-lg shadow-2xs border border-gray-200/80 transition-colors flex items-center gap-1"
          >
            <Keyboard className="w-3 h-3 text-gray-500" />
            <span>Kısayollar</span>
          </button>
        </div>
      </div>
    </section>
  );
};
