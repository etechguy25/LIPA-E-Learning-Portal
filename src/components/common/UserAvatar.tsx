import React from 'react';
import { User, Shield, GraduationCap, BookOpen } from 'lucide-react';
import { Role } from '../../types';

interface UserAvatarProps {
  avatar?: string;
  name?: string;
  role?: Role;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name = 'User',
  role,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 text-2xl'
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-12 h-12'
  };

  // Get user initials
  const initials = name
    ? name
        .split(' ')
        .filter(n => n.length > 0)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('')
    : 'U';

  if (avatar && avatar.trim().length > 0) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-xs shrink-0 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  // Blank avatar fallback: clean, human-centered initials or silhouette with role-based tint
  const roleStyles = {
    student: 'bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 border border-blue-200 dark:border-blue-900',
    instructor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900',
    admin: 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900'
  };

  const activeStyle = role ? roleStyles[role] : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';

  return (
    <div
      className={`rounded-2xl flex items-center justify-center font-bold tracking-tight shadow-xs shrink-0 ${sizeClasses[size]} ${activeStyle} ${className}`}
      title={name}
    >
      {initials ? initials : <User className={iconSizes[size]} />}
    </div>
  );
};
