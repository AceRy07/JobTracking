import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  ChevronDown, 
  Check,
  Database
} from 'lucide-react';
import { APP_LOGO_URL } from '../data/initialData';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  onOpenNewTask: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  previewMode?: 'auto' | 'desktop' | 'mobile';
  setPreviewMode?: (mode: 'auto' | 'desktop' | 'mobile') => void;
  activeWorkspace: string;
  setActiveWorkspace: (ws: string) => void;
  supabaseConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTask,
  searchQuery,
  onSearchChange,
  activeWorkspace,
  setActiveWorkspace,
  supabaseConnected
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const workspaces = [
    'Acme Tech Workspace',
    'FinTech Core Team',
    'Design System Hub'
  ];

  const isConnected = supabaseConnected !== undefined ? supabaseConnected : isSupabaseConfigured;

  return (
    <header className="sticky top-0 left-0 right-0 z-40 h-16 bg-white border-b border-[#e5e7eb] px-4 lg:px-6">
      <div className="w-full h-full flex items-center justify-between gap-3">
        {/* Left branding and workspace */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex items-center gap-2.5">
            <img 
              src={APP_LOGO_URL} 
              alt="İş Takip Paneli Logo" 
              className="h-8 w-8 rounded-lg object-contain shadow-sm"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-base text-[#141b2b] tracking-tight leading-tight">
                İş Takip Paneli
              </span>
              <span className="text-[11px] text-gray-500 hidden sm:inline">Acme Corporation</span>
            </div>
          </div>

          <div className="hidden sm:block h-4 w-px bg-gray-200" />

          {/* Supabase Status Pill */}
          <div 
            title={isConnected ? 'Supabase veritabanı aktif ve bağlı' : 'Supabase key bekleniyor (.env)'}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <Database className="w-3 h-3" />
            <span className="flex h-1.5 w-1.5 rounded-full relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span>{isConnected ? 'Supabase Aktif' : 'Supabase: Key Bekleniyor'}</span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-gray-200" />

          {/* Workspace Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-[#141b2b] transition-colors border border-transparent hover:border-gray-200"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium">{activeWorkspace}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showWorkspaceMenu && (
              <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Çalışma Alanları
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setShowWorkspaceMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 text-gray-800"
                  >
                    <span>{ws}</span>
                    {ws === activeWorkspace && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right action items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="relative flex items-center bg-[#f1f3ff] rounded-lg px-2.5 py-1.5 w-48 sm:w-64 border border-indigo-100 focus-within:border-indigo-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="İş veya proje ara..."
              className="bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none w-full"
            />
            <kbd className="hidden sm:inline text-[10px] font-semibold bg-white border border-gray-300 rounded px-1.5 py-0.5 text-gray-500 shadow-2xs">
              ⌘K
            </kbd>
          </div>

          {/* Add New Task Button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 bg-[#4f46e5] hover:bg-[#4338ca] active:bg-[#3730a3] text-white text-xs sm:text-sm font-medium px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İş Ekle</span>
          </button>
        </div>
      </div>
    </header>
  );
};
