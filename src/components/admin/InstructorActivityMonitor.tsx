import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Activity,
  CalendarPlus,
  FileCheck,
  FileText,
  Video,
  Youtube,
  Send,
  Search,
  Filter,
  Users,
  BookOpen,
  Clock,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { InstructorAction } from '../../types';

export const InstructorActivityMonitor: React.FC = () => {
  const { instructorActions, usersDirectory, courses } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');

  const instructors = usersDirectory.filter(u => u.role === 'instructor');

  const filteredActions = instructorActions.filter(act => {
    const matchesSearch =
      act.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesInst =
      selectedInstructorId === 'all' || act.instructorId === selectedInstructorId;
    const matchesType =
      selectedActionType === 'all' || act.actionType === selectedActionType;
    return matchesSearch && matchesInst && matchesType;
  });

  const getActionBadge = (type: InstructorAction['actionType']) => {
    switch (type) {
      case 'lesson_planned':
        return {
          label: 'Lesson Planned',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
          icon: CalendarPlus
        };
      case 'assignment_created':
        return {
          label: 'Assignment Created',
          color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
          icon: FileCheck
        };
      case 'material_uploaded':
        return {
          label: 'Material Uploaded',
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          icon: FileText
        };
      case 'grade_submitted':
        return {
          label: 'Grade Recorded',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
          icon: Send
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
            Instructor Activity Monitor & Audit
          </h2>
          <p className="text-xs text-slate-500">
            Real-time audit surveillance of faculty lesson planning, assignment publication, and course media uploads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold">
            {instructorActions.length} Actions Logged
          </span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Total Monitored Actions
          </span>
          <p className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1">
            {instructorActions.length}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Full audit trail active</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Active Faculty Members
          </span>
          <p className="text-2xl font-mono font-extrabold text-[#1e3a8a] dark:text-blue-400 mt-1">
            {instructors.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Instructional staff</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Lessons & Syllabi
          </span>
          <p className="text-2xl font-mono font-extrabold text-red-600 dark:text-red-400 mt-1">
            {instructorActions.filter(a => a.actionType === 'lesson_planned').length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Lectures scheduled</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Course Media Uploads
          </span>
          <p className="text-2xl font-mono font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {instructorActions.filter(a => a.actionType === 'material_uploaded').length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Docs, videos & links</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, course, or instructor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedInstructorId}
            onChange={e => setSelectedInstructorId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800"
          >
            <option value="all">All Instructors</option>
            {instructors.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>

          <select
            value={selectedActionType}
            onChange={e => setSelectedActionType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800"
          >
            <option value="all">All Action Types</option>
            <option value="lesson_planned">Lesson Planned</option>
            <option value="assignment_created">Assignment Created</option>
            <option value="material_uploaded">Material Uploaded</option>
            <option value="grade_submitted">Grade Recorded</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Instructor Audit Log Feed
        </h3>

        {filteredActions.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Instructor Actions Recorded
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Actions taken by instructors (lesson planning, assignments, grading, resource uploads) will be captured and displayed here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActions.map(act => {
              const badge = getActionBadge(act.actionType);
              const IconComp = badge.icon;
              return (
                <div
                  key={act.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <IconComp className="w-4 h-4 text-[#1e3a8a] dark:text-blue-400" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {act.instructorName}
                        </span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {act.courseTitle}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {act.details}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="flex items-center sm:justify-end gap-1 text-[11px] font-mono text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{act.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
