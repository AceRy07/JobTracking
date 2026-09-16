import React from 'react';
import { 
  Users, 
  ArrowRight, 
  Lightbulb, 
  Keyboard, 
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { Task, getTaskAssignees } from '../types';
import { ASSIGNEES } from '../data/initialData';

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
  // Haftalık tamamlama verilerini tüm işlere göre dinamik hesapla
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Bitti' || t.completed).length;
  const activeTasks = tasks.filter(t => t.status === 'Aktif' || t.status === 'Kritik').length;
  const pendingTasks = tasks.filter(t => t.status === 'Beklemede').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Ekip üyelerine göre aktif iş dağılımı
  const memberLoads = ASSIGNEES.map(member => {
    const memberActiveTasks = tasks.filter(t => {
      const taskAssignees = getTaskAssignees(t);
      const isAssigned = taskAssignees.some(a => a.name === member.name || a.id === member.id);
      return isAssigned && t.status !== 'Bitti' && !t.completed;
    });
    return {
      ...member,
      activeCount: memberActiveTasks.length
    };
  });

  const maxMemberActive = Math.max(...memberLoads.map(m => m.activeCount), 1);

  // Günlere göre dağılım simülasyonunu görev tarihlerine/durumlarına göre dinamik oranla
  const days = [
    { label: 'Pzt', ratio: Math.min(100, Math.max(25, Math.round((completedTasks * 18) % 85 + 15))) },
    { label: 'Sal', ratio: Math.min(100, Math.max(30, Math.round((activeTasks * 22) % 75 + 25))) },
    { label: 'Çar', ratio: Math.min(100, Math.max(40, Math.round((totalTasks * 14) % 80 + 20))) },
    { label: 'Per', ratio: Math.min(100, Math.max(50, completionRate > 0 ? completionRate : 60)) },
    { label: 'Cum', ratio: Math.min(100, Math.max(35, Math.round(((completedTasks + activeTasks) * 16) % 85 + 15))) }
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Productivity Mini-Widget: Haftalık Tamamlama Oranı */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Haftalık Tamamlama Oranı</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              %{completionRate} Tamamlandı
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tüm panodaki <span className="font-semibold text-gray-800">{totalTasks}</span> işten <span className="font-semibold text-emerald-600">{completedTasks}</span> tanesi tamamlandı, <span className="font-semibold text-indigo-600">{activeTasks}</span> aktif iş yürütülüyor.
          </p>
        </div>

        {/* Progress bar and weekly cadence */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span>Genel İlerleme</span>
            <span className="font-semibold text-gray-800">%{completionRate}</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <div className="flex items-end gap-2 h-12 pt-1">
            {days.map((d, idx) => (
              <div key={d.label} className="flex-1 bg-gray-100 rounded-t-md flex flex-col justify-end items-center h-full group">
                <div 
                  className={`w-full rounded-t-md transition-all ${
                    idx === 3 ? 'bg-indigo-600 shadow-xs' : 'bg-indigo-300 group-hover:bg-indigo-400'
                  }`} 
                  style={{ height: `${d.ratio}%` }}
                />
                <span className={`text-[10px] mt-1 ${idx === 3 ? 'text-indigo-900 font-bold' : 'text-gray-500'}`}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Collaborator Pulse: Aktif İş Dağılımı */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900">Aktif İş Dağılımı</span>
              <span className="text-[11px] text-gray-400">({activeTasks} aktif)</span>
            </div>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="mt-3 flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
            {memberLoads.map((member) => {
              const percentage = Math.round((member.activeCount / maxMemberActive) * 100);
              return (
                <div key={member.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                      <span className="text-gray-800 font-medium truncate">{member.name}</span>
                    </div>
                    <span className="text-gray-500 font-semibold text-[11px] shrink-0 ml-2">
                      {member.activeCount} görev
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${member.activeCount > 0 ? Math.max(percentage, 12) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 text-right border-t border-gray-100 mt-2">
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
              İş listesindeki görevlere tıklayarak detaylı inceleme yapabilir veya doğrudan durumunu tamamlandı olarak işaretleyebilirsiniz.
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-indigo-100/50">
          <span className="text-[11px] text-gray-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Otomatik senkronizasyon açık
          </span>
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
