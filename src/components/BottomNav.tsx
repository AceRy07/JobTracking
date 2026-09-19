import React from 'react';
import { CheckSquare, SlidersHorizontal, Users, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'gorevler' | 'filtreler' | 'ekip' | 'ayarlar';
  setActiveTab: (tab: 'gorevler' | 'filtreler' | 'ekip' | 'ayarlar') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_18px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-[68px] max-w-md mx-auto px-2">
        <button
          onClick={() => setActiveTab('gorevler')}
            className={`flex flex-col items-center justify-center w-16 h-12 gap-0.5 transition-colors ${
            activeTab === 'gorevler' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[11px] mt-1">Görevler</span>
        </button>

        <button
          onClick={() => setActiveTab('filtreler')}
            className={`flex flex-col items-center justify-center w-16 h-12 gap-0.5 transition-colors ${
            activeTab === 'filtreler' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[11px] mt-1">Filtreler</span>
        </button>

        <button
          onClick={() => setActiveTab('ekip')}
            className={`flex flex-col items-center justify-center w-16 h-12 gap-0.5 transition-colors ${
            activeTab === 'ekip' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px] mt-1">Ekip</span>
        </button>

        <button
          onClick={() => setActiveTab('ayarlar')}
            className={`flex flex-col items-center justify-center w-16 h-12 gap-0.5 transition-colors ${
            activeTab === 'ayarlar' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] mt-1">Ayarlar</span>
        </button>
      </div>
    </nav>
  );
};
