import React from 'react';
import { useLms } from '../../context/LmsContext';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  GraduationCap,
  CreditCard,
  CalendarPlus,
  FileCheck,
  Users,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Layers,
  Award,
  Sparkles,
  UserPlus,
  FileText,
  FolderGit2,
  Database,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, currentUser, tuitionStatement, submissions } = useLms();

  const studentBalance = currentUser?.balanceOwed ?? tuitionStatement?.balanceDue ?? 0;

  const studentNavItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Progress Analytics', icon: BarChart3 },
    { id: 'courses', label: 'Enrolled Courses', icon: BookOpen },
    { id: 'assignments', label: 'Assignments & Projects', icon: FileCheck },
    { id: 'schedule', label: 'Class Timetable', icon: Calendar },
    { id: 'grades', label: 'Grades & Transcript', icon: GraduationCap },
    {
      id: 'finances',
      label: 'Financial Record',
      icon: CreditCard,
      badge: studentBalance > 0 ? `$${(studentBalance || 0).toLocaleString()}` : 'Cleared',
      badgeColor: studentBalance > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
    }
  ];

  const instructorNavItems: NavItem[] = [
    { id: 'overview', label: 'Faculty Overview', icon: LayoutDashboard },
    { id: 'my_classes', label: 'Teaching Classes', icon: BookOpen },
    { id: 'projects', label: 'Projects & Deliverables', icon: FolderGit2 },
    { id: 'class_rosters', label: 'Student Rosters per Class', icon: Users },
    { id: 'lessons', label: 'Lesson Scheduler', icon: CalendarPlus },
    {
      id: 'assignments',
      label: 'Assignments & Grading',
      icon: FileCheck,
      badge: submissions.filter(s => s.status === 'pending').length > 0
        ? `${submissions.filter(s => s.status === 'pending').length} pending`
        : undefined,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    { id: 'materials', label: 'Course Materials & Files', icon: FileText },
    { id: 'attendance', label: 'Attendance & Progress', icon: Layers }
  ];

  const adminNavItems: NavItem[] = [
    { id: 'analytics', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'performance_analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'enrollment', label: 'Registration & Enrollment', icon: UserPlus },
    { id: 'all_students', label: 'All Students', icon: GraduationCap },
    { id: 'all_instructors', label: 'All Instructors', icon: Users },
    { id: 'courses_admin', label: 'Course Management', icon: Layers },
    { id: 'financial_record', label: 'Financial Record', icon: CreditCard },
    { id: 'instructor_monitor', label: 'Instructor Activity Monitor', icon: FileCheck },
    { id: 'activity_logs', label: 'Activity Logs & Audit', icon: ShieldCheck, badge: 'Live', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'supabase_schema', label: 'Database & Supabase Schema', icon: Database },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'reports', label: 'Institutional Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const navItems =
    currentRole === 'student'
      ? studentNavItems
      : currentRole === 'instructor'
      ? instructorNavItems
      : adminNavItems;

  return (
    <aside className="w-64 bg-[#0c1a30] border-r border-[#172a46] flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role Context Chip */}
      <div className="p-4 border-b border-[#172a46]">
        <div className="bg-[#112340] rounded-xl p-3 border border-[#1e3a64]/60 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-red-300/80">Active Perspective</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600/20 text-red-300 border border-red-500/30 capitalize">
              {currentRole}
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-1.5 truncate">
            {currentRole === 'student'
              ? 'Student Academic Portal'
              : currentRole === 'instructor'
              ? 'Faculty Academic Console'
              : 'Institutional Administrative Control'}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-red-300/60 uppercase">
          Navigation Modules
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              id={`sidebar-nav-${item.id}`}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#132849]'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-red-400/70'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    isActive ? 'bg-slate-950 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
