import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  ChevronDown, 
  Check, 
  Monitor, 
  Smartphone, 
  SlidersHorizontal,
  User
} from 'lucide-react';
import { APP_LOGO_URL, ASSIGNEES } from '../data/initialData';

interface HeaderProps {
  onOpenNewTask: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  previewMode: 'auto' | 'desktop' | 'mobile';
  setPreviewMode: (mode: 'auto' | 'desktop' | 'mobile') => void;
  activeWorkspace: string;
  setActiveWorkspace: (ws: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTask,
  searchQuery,
  onSearchChange,
  previewMode,
  setPreviewMode,
  activeWorkspace,
  setActiveWorkspace
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const workspaces = [
    'Acme Tech Workspace',
    'FinTech Core Team',
    'Design System Hub'
  ];

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

        {/* Center: Device Switcher (Desktop / Mobile Preview) */}
        <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200/80">
          <button
            onClick={() => setPreviewMode('auto')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              previewMode === 'auto'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Ekran genişliğine göre otomatik uyum"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Otomatik</span>
          </button>
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              previewMode === 'desktop'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Masaüstü tam paneli görüntüle"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Masaüstü</span>
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              previewMode === 'mobile'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Mobil uygulama ekranı önizlemesi"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobil Ekran</span>
          </button>
        </div>

        {/* Right action items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="relative hidden lg:flex items-center bg-[#f1f3ff] rounded-lg px-2.5 py-1.5 w-60 border border-indigo-100 focus-within:border-indigo-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="İş veya proje ara..."
              className="bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 outline-none w-full"
            />
            <kbd className="text-[10px] font-semibold bg-white border border-gray-300 rounded px-1.5 py-0.5 text-gray-500 shadow-2xs">
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

          <div className="h-5 w-px bg-gray-200" />

          {/* Profile & Team Info */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1 group cursor-pointer"
            >
              <img
                src={ASSIGNEES[0].avatarUrl}
                alt="Selin Yılmaz"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-300 group-hover:ring-indigo-500 transition-all"
              />
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Selin Yılmaz
                </span>
                <span className="text-[11px] text-gray-500">Ürün Lideri</span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="font-semibold text-xs text-gray-900">Selin Yılmaz</div>
                  <div className="text-[11px] text-gray-500">selin@acmetech.com</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">● Herkese Açık Erişim</div>
                </div>
                <div className="px-3 py-2 text-[11px] text-gray-500">
                  Bu çalışma alanı oturum açma gerektirmeden tüm ekip üyelerine ve ziyaretçilere açıktır.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
