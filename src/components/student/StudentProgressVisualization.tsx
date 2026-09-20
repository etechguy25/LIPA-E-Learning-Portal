import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Course,
  StudentCourseProgress,
  Assignment,
  StudentSubmission
} from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

interface StudentProgressVisualizationProps {
  assignedCourses: Course[];
  studentProgress: StudentCourseProgress[];
  assignments: Assignment[];
  submissions: StudentSubmission[];
  studentId: string;
}

const PALETTE = ['#1e3a8a', '#2563eb', '#059669', '#7c3aed', '#d97706', '#0891b2'];

export const StudentProgressVisualization: React.FC<StudentProgressVisualizationProps> = ({
  assignedCourses,
  studentProgress,
  assignments,
  submissions,
  studentId
}) => {
  const [activeMetricTab, setActiveMetricTab] = useState<'both' | 'progress' | 'assignments'>('both');

  // Filter assignments relevant to student's enrolled courses
  const assignedCourseIds = new Set(assignedCourses.map(c => c.id));
  const relevantAssignments = assignments.filter(a => assignedCourseIds.has(a.courseId));

  // Student's personal submissions
  const studentSubmissions = submissions.filter(s => s.studentId === studentId);
  const submittedAssignmentIds = new Set(studentSubmissions.map(s => s.assignmentId));

  // 1. Calculate Course Progress Data for Bar Chart
  const courseProgressData = assignedCourses.map((crs, idx) => {
    const prog = studentProgress.find(p => p.courseId === crs.id);
    const progressPercent = prog ? prog.progressPercent : 0;
    const courseAssignments = relevantAssignments.filter(a => a.courseId === crs.id);
    const completedAssignments = courseAssignments.filter(a => submittedAssignmentIds.has(a.id)).length;
    const assignmentRate = courseAssignments.length > 0
      ? Math.round((completedAssignments / courseAssignments.length) * 100)
      : 0;

    return {
      name: crs.code,
      title: crs.title,
      progress: progressPercent,
      assignmentRate,
      credits: crs.credits,
      completedAssignments,
      totalAssignments: courseAssignments.length,
      fillColor: PALETTE[idx % PALETTE.length]
    };
  });

  // 2. Calculate Assignment Completion Rates for Donut/Pie Chart
  const totalDeliverables = relevantAssignments.length;
  const gradedCount = studentSubmissions.filter(
    s => s.status === 'graded' && relevantAssignments.some(a => a.id === s.assignmentId)
  ).length;
  const pendingReviewCount = studentSubmissions.filter(
    s => s.status === 'pending' && relevantAssignments.some(a => a.id === s.assignmentId)
  ).length;
  const unsubmittedCount = Math.max(0, totalDeliverables - (gradedCount + pendingReviewCount));

  const assignmentCompletionPercentage = totalDeliverables > 0
    ? Math.round(((gradedCount + pendingReviewCount) / totalDeliverables) * 100)
    : 0;

  const averageCourseProgress = courseProgressData.length > 0
    ? Math.round(courseProgressData.reduce((acc, c) => acc + c.progress, 0) / courseProgressData.length)
    : 0;

  const assignmentBreakdownData = [
    { name: 'Completed & Graded', value: gradedCount, color: '#059669' },
    { name: 'Submitted (Review Pending)', value: pendingReviewCount, color: '#2563eb' },
    { name: 'Unsubmitted / Pending', value: unsubmittedCount, color: '#e2e8f0' }
  ].filter(item => item.value > 0 || totalDeliverables === 0);

  // If completely empty
  const hasData = assignedCourses.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-400 flex items-center justify-center mx-auto">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic Analytics Unavailable</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You are not currently enrolled in any academic programs. Course progress benchmarks and assignment completion rates will appear here once you are registered.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header with Title & Quick Controls */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
              Academic Performance & Completion Analytics
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recharts analytics tracking individual syllabus completion and assignment submission velocity
          </p>
        </div>

        {/* View Filter Pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveMetricTab('both')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeMetricTab === 'both'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Combined View
          </button>
          <button
            onClick={() => setActiveMetricTab('progress')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeMetricTab === 'progress'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Course Progress
          </button>
          <button
            onClick={() => setActiveMetricTab('assignments')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeMetricTab === 'assignments'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Assignments
          </button>
        </div>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Enrolled Courses</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{assignedCourses.length}</span>
            <span className="text-xs text-slate-500">Active</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Avg. Course Progress</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-[#1e3a8a] dark:text-blue-400">{averageCourseProgress}%</span>
            <span className="text-xs text-emerald-600 font-semibold">On Track</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Assignment Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {assignmentCompletionPercentage}%
            </span>
            <span className="text-xs text-slate-500">Overall</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Deliverables Handed In</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {gradedCount + pendingReviewCount}
            </span>
            <span className="text-xs text-slate-400">of {totalDeliverables} total</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="p-6">
        <div className={`grid gap-6 ${activeMetricTab === 'both' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
          {/* Chart 1: Course Progress & Assignment Rate Comparison (BarChart) */}
          {(activeMetricTab === 'both' || activeMetricTab === 'progress') && (
            <div className={`${activeMetricTab === 'both' ? 'lg:col-span-7' : 'w-full'} space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#1e3a8a] dark:text-blue-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Course Progress & Assignment Rates By Program
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Percentages (0 - 100%)</span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={courseProgressData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={val => `${val}%`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1.5 max-w-xs">
                              <p className="font-bold text-sm text-blue-300">{d.name}: {d.title}</p>
                              <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
                                <span>Course Progress:</span>
                                <span className="font-mono font-bold text-white">{d.progress}%</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span>Assignment Completion:</span>
                                <span className="font-mono font-bold text-emerald-400">{d.assignmentRate}% ({d.completedAssignments}/{d.totalAssignments})</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span>Academic Weight:</span>
                                <span className="font-mono text-slate-400">{d.credits} Credits</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={32}
                      formatter={value => (
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium mr-3">
                          {value === 'progress' ? 'Syllabus Progress (%)' : 'Assignment Rate (%)'}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="progress"
                      fill="#1e3a8a"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Bar
                      dataKey="assignmentRate"
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Course Badges Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {courseProgressData.map(d => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#1e3a8a] dark:text-blue-300 text-[10px]">
                        {d.name}
                      </span>
                      <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                        {d.title}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                      {d.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart 2: Assignment Completion Rates (Donut Chart) */}
          {(activeMetricTab === 'both' || activeMetricTab === 'assignments') && (
            <div className={`${activeMetricTab === 'both' ? 'lg:col-span-5' : 'w-full'} space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Assignment Completion Status
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {gradedCount + pendingReviewCount} / {totalDeliverables} Done
                </span>
              </div>

              <div className="h-64 w-full flex items-center justify-center relative">
                {totalDeliverables === 0 ? (
                  <div className="text-center p-6 text-slate-400 space-y-1">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
                    <p className="text-xs font-semibold">All Deliverables Cleared</p>
                    <p className="text-[11px]">No active coursework due at this time</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assignmentBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={82}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {assignmentBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0];
                              const pct = totalDeliverables > 0
                                ? Math.round((Number(d.value) / totalDeliverables) * 100)
                                : 0;
                              return (
                                <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700">
                                  <span className="font-semibold block">{d.name}:</span>
                                  <span className="font-mono text-emerald-400 font-bold">{d.value} items ({pct}%)</span>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Rate Percentage Metric */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                        {assignmentCompletionPercentage}%
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Turned In
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Legend and Breakdown Summary */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="font-medium text-emerald-900 dark:text-emerald-300">Completed & Graded</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">{gradedCount}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="font-medium text-blue-900 dark:text-blue-300">Submitted (Awaiting Review)</span>
                  </div>
                  <span className="font-mono font-bold text-blue-800 dark:text-blue-300">{pendingReviewCount}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Pending Submissions</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{unsubmittedCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
