import React from 'react';
import { Assignee } from '../types';

interface AssigneeAvatarGroupProps {
  assignees: Assignee[];
  maxDisplay?: number;
  showNames?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AssigneeAvatarGroup: React.FC<AssigneeAvatarGroupProps> = ({
  assignees,
  maxDisplay = 3,
  showNames = true,
  size = 'md'
}) => {
  if (!assignees || assignees.length === 0) {
    return (
      <span className="text-xs text-gray-400 italic">Atanmamış</span>
    );
  }

  const displayed = assignees.slice(0, maxDisplay);
  const extraCount = assignees.length - maxDisplay;

  const sizeClass = size === 'sm' ? 'w-5 h-5 text-[10px]' : size === 'lg' ? 'w-8 h-8 text-xs' : 'w-6 h-6 text-xs';

  if (assignees.length === 1) {
    const a = assignees[0];
    return (
      <div className="flex items-center gap-1.5" title={`${a.name} (${a.role})`}>
        <div className={`${sizeClass} rounded-full flex items-center justify-center font-semibold overflow-hidden border border-gray-200 shrink-0 ${a.badgeBg || 'bg-indigo-100'} ${a.badgeColor || 'text-indigo-800'}`}>
          {a.avatarUrl ? (
            <img src={a.avatarUrl} alt={a.name} className="w-full h-full object-cover" />
          ) : (
            a.initials
          )}
        </div>
        {showNames && (
          <span className="text-xs font-medium text-gray-800 truncate max-w-[130px]">
            {a.name}
          </span>
        )}
      </div>
    );
  }

  const allNames = assignees.map(a => a.name).join(', ');

  return (
    <div className="flex items-center gap-1.5" title={allNames}>
      <div className="flex -space-x-2 overflow-hidden py-0.5">
        {displayed.map((a) => (
          <div
            key={a.id}
            className={`inline-block ${sizeClass} rounded-full ring-2 ring-white font-semibold overflow-hidden border border-gray-200 shrink-0 ${a.badgeBg || 'bg-indigo-100'} ${a.badgeColor || 'text-indigo-800'}`}
            title={`${a.name} (${a.role})`}
          >
            {a.avatarUrl ? (
              <img src={a.avatarUrl} alt={a.name} className="w-full h-full object-cover" />
            ) : (
              a.initials
            )}
          </div>
        ))}
        {extraCount > 0 && (
          <div
            className={`inline-flex items-center justify-center ${sizeClass} rounded-full bg-gray-100 text-gray-700 ring-2 ring-white text-[10px] font-bold border border-gray-200 shrink-0`}
          >
            +{extraCount}
          </div>
        )}
      </div>

      {showNames && (
        <span className="text-xs font-medium text-gray-700 truncate max-w-[140px]">
          {assignees[0].name.split(' ')[0]} +{assignees.length - 1} kişi
        </span>
      )}
    </div>
  );
};
