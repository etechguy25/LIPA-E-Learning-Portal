import React, { useState, useRef, useEffect } from 'react';
import { useLms } from '../../context/LmsContext';
import { Role } from '../../types';
import { LipaLogo } from '../common/LipaLogo';
import { UserAvatar } from '../common/UserAvatar';
import {
  Bell,
  Mail,
  Search,
  CreditCard,
  PlusCircle,
  Shield,
  GraduationCap,
  BookOpen,
  UserCheck,
  Check,
  Calendar,
  Layers,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  onOpenNewLesson?: () => void;
  onOpenNewCourse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewLesson, onOpenNewCourse }) => {
  const {
    currentRole,
    currentUser,
    switchRole,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    emailNotifications,
    unreadEmailCount,
    setActiveEmailModal,
    openPaymentModal,
    settings,
    themeMode,
    toggleThemeMode
  } = useLms();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: { role: Role; label: string; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { role: 'student', label: 'Student Portal', name: 'Student Account', icon: GraduationCap },
    { role: 'instructor', label: 'Instructor Portal', name: 'Faculty Instructor', icon: BookOpen },
    { role: 'admin', label: 'Administrator Portal', name: 'System Administrator', icon: Shield }
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0c1a30] text-white border-b border-[#172a46] shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Term Identity */}
          <div className="flex items-center space-x-3 min-w-0">
            <LipaLogo size="md" variant="plain" />
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-base tracking-tight text-white">
                  LIPA eLearning Center
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#142646] text-red-300 rounded border border-red-500/30">
                  Est. 1969
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <span className="italic text-red-200/80 font-serif hidden lg:inline">Transforming Minds &amp; Institutions</span>
                <span className="text-slate-600 hidden lg:inline">•</span>
                <Calendar className="w-3 h-3 text-red-400" />
                <span className="text-slate-300">{settings.currentTerm}</span>
              </div>
            </div>
          </div>

          {/* Center: Role Switcher Pill Bar (Key requirement: easy evaluation of all 3 personas) */}
          <div className="hidden md:flex items-center bg-[#060e1a]/90 p-1 rounded-xl border border-[#172a46] shadow-inner">
            <div className="text-[10px] font-semibold text-red-300/80 uppercase tracking-wider px-2.5">
              Role:
            </div>
            <div className="flex space-x-1">
              {rolesList.map(item => {
                const Icon = item.icon;
                const isActive = currentRole === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => switchRole(item.role)}
                    id={`role-switch-${item.role}`}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-red-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#132849]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-red-400/80'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Controls: Role Contextual Quick Action, Notifications, Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Action button tailored to current role */}
            {currentRole === 'student' && (
              <button
                onClick={openPaymentModal}
                id="header-pay-tuition-btn"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Tuition</span>
              </button>
            )}

            {currentRole === 'instructor' && onOpenNewLesson && (
              <button
                onClick={onOpenNewLesson}
                id="header-new-lesson-btn"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Schedule Lesson</span>
              </button>
            )}

            {currentRole === 'admin' && onOpenNewCourse && (
              <button
                onClick={onOpenNewCourse}
                id="header-new-course-btn"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors shadow-xs cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-white" />
                <span>New Course</span>
              </button>
            )}

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleThemeMode}
              id="theme-toggle-btn"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Dark/Light Mode"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-red-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Official Dispatched Mailbox Button */}
            <button
              onClick={() => setActiveEmailModal(true)}
              id="header-mailbox-btn"
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Official Outbox & Password Activation Links"
              aria-label="Mailbox"
            >
              <Mail className="w-4 h-4" />
              {unreadEmailCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs">
                  {unreadEmailCount}
                </span>
              )}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                id="header-notifications-btn"
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  id="notifications-flyout"
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Notifications
                      </span>
                      {unreadNotificationCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded">
                          {unreadNotificationCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        <Check className="w-3 h-3 mr-1" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                        <p className="font-medium text-slate-600">No Notifications</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">You're all caught up for this session</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            !notif.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="font-semibold text-slate-900">{notif.title}</p>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-2 text-[11px] leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                    <span className="text-[11px] text-slate-500">
                      All academic notices are synced with official university records
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                id="header-profile-btn"
                className="flex items-center space-x-2 p-1 pl-2 rounded-xl hover:bg-slate-800 transition-colors border border-slate-800"
              >
                {currentUser.role === 'admin' ? (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold text-xs shadow-xs ring-1 ring-red-400/40">
                    <Shield className="w-4 h-4" />
                  </div>
                ) : (
                  <UserAvatar
                    user={currentUser}
                    size="sm"
                    className="w-7 h-7 rounded-lg ring-1 ring-slate-700 text-xs"
                  />
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-red-400 font-mono capitalize">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                  id="profile-flyout"
                >
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    {currentUser.role === 'admin' ? (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-red-400/30">
                        <Shield className="w-6 h-6" />
                      </div>
                    ) : (
                      <UserAvatar
                        user={currentUser}
                        size="md"
                        className="w-12 h-12 rounded-xl text-base"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {currentUser.studentId || currentUser.facultyId || 'ADMIN'}
                      </span>
                    </div>
                  </div>

                  <div className="py-2 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]" title={currentUser.department}>
                        {currentUser.department}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Status:</span>
                      <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                        <UserCheck className="w-3 h-3 mr-1" /> Active
                      </span>
                    </div>
                  </div>

                  {/* Mobile Role Switcher inside dropdown */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 md:hidden">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Switch Role View:
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {rolesList.map(item => (
                        <button
                          key={item.role}
                          onClick={() => {
                            switchRole(item.role);
                            setShowProfileMenu(false);
                          }}
                          className={`py-1.5 text-[11px] rounded-lg font-medium text-center cursor-pointer ${
                            currentRole === item.role
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
