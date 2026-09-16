import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  MessageSquare, 
  Paperclip, 
  Send,
  Link as LinkIcon
} from 'lucide-react';
import { Task, TaskStatus, getTaskAssignees } from '../types';
import { AssigneeAvatarGroup } from './AssigneeAvatarGroup';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onToggleComplete: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onToggleComplete,
  onUpdateStatus,
  onDeleteTask,
  onEditTask
}) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<string[]>([
    'Sprint toplantısında mutabık kalındı, test senaryoları hazırlanıyor.',
    'API dokümantasyonu staging ortamında güncellendi.'
  ]);

  if (!task) return null;

  const isDone = task.status === 'Bitti' || task.completed;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments(prev => [...prev, commentText.trim()]);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              {task.code}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
              {task.project}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEditTask(task);
              }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
              title="Düzenle"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Status */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className={`text-lg font-bold ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {task.title}
            </h2>

            <button
              onClick={() => onToggleComplete(task.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isDone
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isDone ? 'Tamamlandı' : 'Tamamla'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Durum:</span>
            <select
              value={task.status}
              onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
              className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-800 outline-none hover:bg-white"
            >
              <option value="Aktif">Aktif</option>
              <option value="Bitti">Bitti</option>
              <option value="Beklemede">Beklemede</option>
              <option value="Kritik">Kritik</option>
            </select>
          </div>
        </div>

        {/* Details Content */}
        <div className="bg-[#f1f3ff]/50 rounded-xl p-3.5 border border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Yapılacak İş Detayları
          </h4>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {task.details}
          </p>
        </div>

        {/* Attributes Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-gray-400 block text-[10px]">Sorumlu Kişi(ler)</span>
              <div className="mt-0.5">
                <AssigneeAvatarGroup assignees={getTaskAssignees(task)} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <span className="text-gray-400 block text-[10px]">Teslim Tarihi</span>
              <span className="font-semibold text-gray-800">{task.dueDate} {task.dueStatusNote ? `(${task.dueStatusNote})` : ''}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-100 pt-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Yorumlar & Güncellemeler ({comments.length})</span>
          </h4>

          <div className="space-y-2 max-h-36 overflow-y-auto mb-3">
            {comments.map((c, i) => (
              <div key={i} className="text-xs bg-gray-50 p-2 rounded-lg text-gray-700 border border-gray-100">
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <span className="font-medium text-gray-600">Selin Yılmaz</span>
                  <span>Bugün 10:24</span>
                </div>
                {c}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Yorum ekle..."
              className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Gönder</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
