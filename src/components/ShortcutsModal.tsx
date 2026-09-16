import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ + K / Ctrl + K', description: 'Hızlı arama çubuğuna odaklan' },
    { key: 'Boşluk (Space)', description: 'Seçili satırdaki görevin detaylarını önizle' },
    { key: 'N', description: 'Yeni görev ekleme penceresini aç' },
    { key: '1', description: 'Tablo görünümüne geç' },
    { key: '2', description: 'Pano (Kanban) görünümüne geç' },
    { key: '3', description: 'Çizelge görünümüne geç' },
    { key: 'Esc', description: 'Açık pencere veya modalları kapat' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Klavye Kısayolları</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-600">{s.description}</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800 font-mono font-semibold rounded shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
};
