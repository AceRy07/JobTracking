import React, { useState } from 'react';
import { X, FolderPlus, Check } from 'lucide-react';
import { Project } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, 'id'>) => void;
}

const PRESET_COLORS = [
  { label: 'İndigo', value: '#4f46e5' },
  { label: 'Yeşil', value: '#006e2d' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Kırmızı', value: '#dc2626' },
  { label: 'Gök Mavisi', value: '#0284c7' },
  { label: 'Mor', value: '#7c3aed' },
  { label: 'Gül Kurusu', value: '#e11d48' },
  { label: 'Gri', value: '#4b5563' }
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name: name.trim(),
      color,
      description: description.trim()
    });

    setName('');
    setDescription('');
    setColor(PRESET_COLORS[0].value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Yeni Proje Oluştur</h3>
              <p className="text-xs text-gray-500">Çalışma alanınıza yeni proje ekleyin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Proje Adı *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: E-Ticaret Entegrasyonu"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
              autoFocus
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Proje Rengi
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => {
                const isSelected = color === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Açıklama / Hedef (İsteğe bağlı)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Projenin amacı veya kapsamı hakkında kısa not..."
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all"
            >
              Projeyi Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
