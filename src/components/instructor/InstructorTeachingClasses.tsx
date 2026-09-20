import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  BookOpen,
  Users,
  Calendar,
  MapPin,
  Globe,
  FolderGit2,
  CalendarPlus,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Course } from '../../types';

interface InstructorTeachingClassesProps {
  onSelectClass: (courseId: string) => void;
  onNavigateToTab: (tab: string, courseId?: string) => void;
  onOpenSendProjectModal: (courseId: string) => void;
  onOpenLessonModal: (courseId: string) => void;
  selectedCourseId: string;
}

export const InstructorTeachingClasses: React.FC<InstructorTeachingClassesProps> = ({
  onSelectClass,
  onNavigateToTab,
  onOpenSendProjectModal,
  onOpenLessonModal,
  selectedCourseId
}) => {
  const { currentUser, courses, openClassroom, assignments, submissions } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'Online' | 'On-site'>('all');

  // Filter courses assigned to this instructor
  const instructorCourses = courses.filter(
    c =>
      c.instructorId === currentUser.id ||
      c.instructorName === currentUser.name ||
      (currentUser.assignedCourseIds && currentUser.assignedCourseIds.includes(c.id))
  );

  const filteredCourses = instructorCourses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.classroom && course.classroom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      course.room.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode =
      filterMode === 'all' ||
      (filterMode === 'Online' && (course.location === 'Online' || course.mode === 'online')) ||
      (filterMode === 'On-site' && (course.location === 'On-site' || course.mode === 'in-person'));

    return matchesSearch && matchesMode;
  });

  const totalStudents = instructorCourses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  const totalCapacity = instructorCourses.reduce((acc, c) => acc + (c.capacity || 40), 0);
  const onlineCount = instructorCourses.filter(c => c.location === 'Online' || c.mode === 'online').length;
  const onsiteCount = instructorCourses.filter(c => c.location === 'On-site' || c.mode === 'in-person').length;

  return (
    <div className="space-y-6" id="instructor-teaching-classes-view">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#10203a] to-blue-950 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Multi-Class Teaching Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Assigned Teaching Classes
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage curricula across multiple assigned classes. Oversee physical classrooms and virtual learning environments, dispatch class projects, and inspect individual student rosters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToTab('projects')}
              id="instructor-goto-projects-btn"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center shadow-xs cursor-pointer"
            >
              <FolderGit2 className="w-3.5 h-3.5 mr-1.5" />
              Send Class Project
            </button>
            <button
              onClick={() => onNavigateToTab('class_rosters')}
              id="instructor-goto-rosters-btn"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all flex items-center shadow-xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
              View Class Rosters
            </button>
          </div>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Classes Taught
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {instructorCourses.length}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block mt-1">
            Active Cohorts
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Enrolled Students
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {totalStudents}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
            Capacity: {totalCapacity} ({totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0}%)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            On-Site Classrooms
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {onsiteCount}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            Campus lecture halls &amp; labs
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Online Virtual Classes
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {onlineCount}
          </p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium block mt-1">
            Remote &amp; hybrid instruction
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by class title, code, or classroom..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Location Mode:</span>
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Modes
            </button>
            <button
              onClick={() => setFilterMode('On-site')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                filterMode === 'On-site'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              On-site
            </button>
            <button
              onClick={() => setFilterMode('Online')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                filterMode === 'Online'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Online
            </button>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {instructorCourses.length === 0 ? 'No Classes Assigned Yet' : 'No Matching Classes Found'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {instructorCourses.length === 0
              ? 'Classes assigned to you by the Academic Administration will appear here for teaching and student management.'
              : 'Try clearing your search query or location filter to view your assigned classes.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const isOnline = course.location === 'Online' || course.mode === 'online';
            const courseProjects = assignments.filter(a => a.courseId === course.id && a.isProject);
            const courseSubmissions = submissions.filter(s => s.courseId === course.id && s.status === 'pending');
            const percentFilled = course.capacity > 0 ? Math.min(100, Math.round((course.enrolledCount / course.capacity) * 100)) : 0;
            const isSelected = selectedCourseId === course.id;

            return (
              <div
                key={course.id}
                id={`teaching-class-card-${course.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Top Bar: Code, Location Badge, Classroom */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                        {course.code}
                      </span>
                      <span className="ml-2 text-[11px] font-medium text-slate-400">
                        {course.term || 'Fall 2026'}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isOnline
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {isOnline ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {isOnline ? 'Online' : 'On-site'}
                    </span>
                  </div>

                  {/* Course Title */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {course.description || 'Comprehensive curriculum instruction and deliverables.'}
                    </p>
                  </div>

                  {/* Key Details: Classroom & Schedule */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2 text-xs border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        Classroom / Title:
                      </span>
                      <span className="font-semibold font-mono text-slate-900 dark:text-white">
                        {course.classroom || course.room || (isOnline ? 'Virtual Hall' : 'Hall 101')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        Meeting Schedule:
                      </span>
                      <span className="font-medium text-[11px] truncate max-w-[160px]" title={course.schedule}>
                        {course.schedule || 'TBA'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Class Enrollment</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {course.enrolledCount} / {course.capacity} students
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badges: Projects & Pending Deliverables */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{courseProjects.length} Assigned Project(s)</span>
                    </div>
                    {courseSubmissions.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {courseSubmissions.length} to grade
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onSelectClass(course.id);
                        onNavigateToTab('class_rosters', course.id);
                      }}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Class Roster</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectClass(course.id);
                        onOpenSendProjectModal(course.id);
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Send Project</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => {
                        onSelectClass(course.id);
                        onOpenLessonModal(course.id);
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      <CalendarPlus className="w-3 h-3 text-red-500" />
                      <span>Plan Lesson</span>
                    </button>

                    <button
                      onClick={() => openClassroom(course.id)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Launch Classroom</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
