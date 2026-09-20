import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  FolderGit2,
  Plus,
  Calendar,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  FileCode,
  Archive,
  ExternalLink,
  ChevronRight,
  Filter,
  AlertCircle,
  Eye,
  Check,
  X
} from 'lucide-react';
import { Assignment, StudentSubmission } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface InstructorProjectsPageProps {
  isSendProjectModalOpen: boolean;
  setIsSendProjectModalOpen: (open: boolean) => void;
  preselectedCourseId?: string;
}

export const InstructorProjectsPage: React.FC<InstructorProjectsPageProps> = ({
  isSendProjectModalOpen,
  setIsSendProjectModalOpen,
  preselectedCourseId
}) => {
  const {
    currentUser,
    courses,
    assignments,
    submissions,
    sendProject,
    gradeSubmission,
    usersDirectory
  } = useLms();

  // Instructor's courses
  const instructorCourses = courses.filter(
    c =>
      c.instructorId === currentUser.id ||
      c.instructorName === currentUser.name ||
      (currentUser.assignedCourseIds && currentUser.assignedCourseIds.includes(c.id))
  );

  const [filterCourseId, setFilterCourseId] = useState<string>('all');

  // Form State for Send Project Modal
  const [targetCourseId, setTargetCourseId] = useState<string>(
    preselectedCourseId || instructorCourses[0]?.id || ''
  );
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDueDate, setProjectDueDate] = useState('2026-11-15');
  const [projectPoints, setProjectPoints] = useState('100');
  const [submissionType, setSubmissionType] = useState<'repository' | 'zip_archive' | 'document' | 'all'>('repository');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectBrief, setProjectBrief] = useState(
    'Phase 1: Architecture blueprint & requirements specification.\nPhase 2: Core modules implementation with unit test coverage.\nPhase 3: Deployment verification & executive technical report.'
  );

  // Active Project for Reviewing Submissions
  const [activeProjectForSubmissions, setActiveProjectForSubmissions] = useState<Assignment | null>(null);

  // Selected Submission for Grading Modal
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('95');
  const [feedbackInput, setFeedbackInput] = useState<string>(
    'Exceptional architectural decomposition and test suite completeness.'
  );

  // Sync preselectedCourseId when changed
  React.useEffect(() => {
    if (preselectedCourseId) {
      setTargetCourseId(preselectedCourseId);
    }
  }, [preselectedCourseId]);

  // Handle Send Project Submit
  const handleSendProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    const targetCourse = courses.find(c => c.id === targetCourseId) || instructorCourses[0];
    if (!targetCourse) return;

    sendProject({
      courseId: targetCourse.id,
      courseCode: targetCourse.code,
      courseTitle: targetCourse.title,
      title: projectTitle,
      dueDate: projectDueDate,
      totalPoints: parseInt(projectPoints) || 100,
      totalStudents: targetCourse.enrolledCount || 0,
      description: projectDescription || 'Complete all deliverables according to project specifications.',
      isProject: true,
      projectBrief: projectBrief,
      submissionType: submissionType
    });

    // Reset Form
    setProjectTitle('');
    setProjectDescription('');
    setIsSendProjectModalOpen(false);
  };

  // Handle Save Grade
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    gradeSubmission(
      selectedSubmission.id,
      parseFloat(gradeInput) || 0,
      feedbackInput
    );
    setSelectedSubmission(null);
  };

  // Filter projects (assignments where isProject is true)
  const instructorCourseIds = instructorCourses.map(c => c.id);
  const instructorProjects = assignments.filter(
    a => instructorCourseIds.includes(a.courseId) && a.isProject
  );

  const displayedProjects = instructorProjects.filter(p =>
    filterCourseId === 'all' ? true : p.courseId === filterCourseId
  );

  const projectSubmissions = submissions.filter(
    s => instructorCourseIds.includes(s.courseId)
  );

  const pendingProjectGrading = projectSubmissions.filter(s => s.status === 'pending');

  return (
    <div className="space-y-6" id="instructor-projects-console">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Faculty Coursework & Project Dispatch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Class Projects & Deliverables
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Dispatch comprehensive term projects, capstone assignments, and practical coursework to any of your assigned classes. Students will automatically receive email notifications with project guidelines.
            </p>
          </div>

          <button
            onClick={() => setIsSendProjectModalOpen(true)}
            id="instructor-send-new-project-btn"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Send New Project
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Projects Dispatched
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {instructorProjects.length}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block mt-1">
            Across {instructorCourses.length} classes
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Submissions Received
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {projectSubmissions.length}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
            Student deliverables
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Pending Grading
          </span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {pendingProjectGrading.length}
          </p>
          <span className="text-[11px] text-amber-600 font-medium block mt-1">
            Awaiting evaluation
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Average Project Grade
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            92%
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            Cohort benchmark
          </span>
        </div>
      </div>

      {/* Filter by Course Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Filter By Class:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCourseId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterCourseId === 'all'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Classes ({instructorProjects.length})
          </button>
          {instructorCourses.map(crs => {
            const count = instructorProjects.filter(p => p.courseId === crs.id).length;
            return (
              <button
                key={crs.id}
                onClick={() => setFilterCourseId(crs.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterCourseId === crs.id
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {crs.code} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects List */}
      {displayedProjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <FolderGit2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Projects Sent Yet
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Dispatch term projects, laboratory assignments, or case studies to any class you teach. Students in that class will automatically be notified.
          </p>
          <button
            onClick={() => setIsSendProjectModalOpen(true)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            Send First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedProjects.map(project => {
            const targetCourse = courses.find(c => c.id === project.courseId);
            const subsForProj = submissions.filter(s => s.assignmentId === project.id || s.courseId === project.courseId);
            const gradedCount = subsForProj.filter(s => s.status === 'graded').length;

            return (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-3">
                  {/* Top Bar: Course Code & Due Date */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 border border-blue-200/60">
                      {project.courseCode} • {targetCourse?.classroom || targetCourse?.room || 'Classroom'}
                    </span>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      Due: {project.dueDate}
                    </span>
                  </div>

                  {/* Project Title & Deliverable Type */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <Award className="w-3 h-3 text-amber-500" />
                        {project.totalPoints} Max Points
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                        {project.submissionType === 'repository' ? (
                          <>
                            <FileCode className="w-3 h-3" />
                            <span>Git Repository</span>
                          </>
                        ) : project.submissionType === 'zip_archive' ? (
                          <>
                            <Archive className="w-3 h-3" />
                            <span>ZIP Archive</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3" />
                            <span>PDF Specification</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* Project Brief / Milestones Preview */}
                  {project.projectBrief && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                        Project Milestones:
                      </span>
                      <p className="text-[11px] whitespace-pre-line line-clamp-2">
                        {project.projectBrief}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer: Submission Counter & Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {subsForProj.length}
                    </span>
                    <span className="text-slate-500"> / {project.totalStudents || targetCourse?.enrolledCount || 0} Submissions</span>
                    <span className="ml-2 text-[10px] font-semibold text-emerald-600">
                      ({gradedCount} Graded)
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveProjectForSubmissions(project)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review &amp; Grade</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Send New Project to Class */}
      {isSendProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-600" />
                Send Project to Class
              </h3>
              <button
                onClick={() => setIsSendProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendProject} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Class / Cohort *
                </label>
                <select
                  value={targetCourseId}
                  onChange={e => setTargetCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  required
                >
                  {instructorCourses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title} ({c.classroom || c.room || 'Classroom'}, {c.location || 'On-site'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Capstone Cloud Architecture & Microservices Implementation"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={projectDueDate}
                    onChange={e => setProjectDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Maximum Points *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={projectPoints}
                    onChange={e => setProjectPoints(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Expected Submission Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'repository', label: 'Git Repo', icon: FileCode },
                    { id: 'zip_archive', label: 'ZIP File', icon: Archive },
                    { id: 'document', label: 'PDF Report', icon: FileText },
                    { id: 'all', label: 'Any Format', icon: FolderGit2 }
                  ].map(item => {
                    const Icon = item.icon;
                    const isSel = submissionType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSubmissionType(item.id as any)}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSel
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Project Description &amp; Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide an executive summary of the project goals, deliverables, and expectations..."
                  value={projectDescription}
                  onChange={e => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Project Milestones &amp; Evaluation Rubric
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the grading rubric, milestone deadlines, and submission requirements..."
                  value={projectBrief}
                  onChange={e => setProjectBrief(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200/60 dark:border-blue-900/60 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed">
                  <strong>Automatic Email Dispatch:</strong> Enrolled students in this class will immediately receive an official email notification with the project title, due date, submission format, and milestone instructions.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSendProjectModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-send-project-btn"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Project to Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal: Review Submissions for a Project */}
      {activeProjectForSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-blue-600" />
                  Project Submissions: {activeProjectForSubmissions.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeProjectForSubmissions.courseCode} • Max Points: {activeProjectForSubmissions.totalPoints} • Due: {activeProjectForSubmissions.dueDate}
                </p>
              </div>
              <button
                onClick={() => setActiveProjectForSubmissions(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Submissions Table */}
            {projectSubmissions.filter(s => s.assignmentId === activeProjectForSubmissions.id || s.courseId === activeProjectForSubmissions.courseId).length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Submissions Received Yet
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Enrolled students will upload their repository links or archive files prior to the deadline.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Deliverable</th>
                      <th className="py-2.5 px-3">Turned In</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {projectSubmissions
                      .filter(s => s.assignmentId === activeProjectForSubmissions.id || s.courseId === activeProjectForSubmissions.courseId)
                      .map(sub => (
                        <tr key={sub.id}>
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2.5">
                              <UserAvatar
                                avatar={sub.studentAvatar}
                                name={sub.studentName}
                                size="sm"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{sub.studentName}</div>
                                <div className="text-[10px] font-mono text-slate-400">{sub.studentId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-blue-600 dark:text-blue-400 text-[11px]">
                              {sub.fileAttachment || 'repository_link'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-500">
                            {sub.submittedAt}
                          </td>
                          <td className="py-3 px-3 text-center font-bold">
                            {sub.score !== undefined ? `${sub.score}/${sub.maxScore}` : '—'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === 'graded'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {sub.status === 'graded' ? 'Graded' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setGradeInput(sub.score ? String(sub.score) : '95');
                                setFeedbackInput(sub.feedback || 'Excellent work on deliverables and documentation.');
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                            >
                              {sub.status === 'graded' ? 'Update Grade' : 'Grade'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Grade Project Submission
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSubmission.studentName} ({selectedSubmission.studentId})
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Submitted Deliverable</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedSubmission.fileAttachment || 'Project_Final.zip'}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Points Awarded (Max: {selectedSubmission.maxScore} pts) *
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedSubmission.maxScore}
                  value={gradeInput}
                  onChange={e => setGradeInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Qualitative Evaluation &amp; Instructor Feedback *
                </label>
                <textarea
                  rows={4}
                  value={feedbackInput}
                  onChange={e => setFeedbackInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1e3a8a] text-white font-semibold hover:bg-[#1e3a8a]/90 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save Grade &amp; Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
