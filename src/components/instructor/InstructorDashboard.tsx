import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  BookOpen,
  CalendarPlus,
  FileCheck,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Send,
  AlertTriangle,
  FileText,
  UserCheck,
  Award,
  ChevronRight,
  TrendingUp,
  Download,
  Filter,
  Eye,
  Video,
  Youtube,
  Trash2,
  ExternalLink,
  Layers,
  Upload,
  FolderGit2
} from 'lucide-react';
import { Lesson, Assignment, StudentSubmission, AttendanceRecord, CourseMaterial } from '../../types';
import { InstructorTeachingClasses } from './InstructorTeachingClasses';
import { InstructorProjectsPage } from './InstructorProjectsPage';
import { InstructorClassRosters } from './InstructorClassRosters';

interface InstructorDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCreateLessonModalOpen: boolean;
  setIsCreateLessonModalOpen: (open: boolean) => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  activeTab,
  setActiveTab,
  isCreateLessonModalOpen,
  setIsCreateLessonModalOpen
}) => {
  const {
    currentUser,
    courses,
    lessons,
    assignments,
    submissions,
    attendanceRoster,
    createLesson,
    createAssignment,
    gradeSubmission,
    updateAttendance,
    markAllAttendance,
    addCourseMaterial,
    deleteCourseMaterial,
    openClassroom
  } = useLms();

  // Selected course for instructor (only courses assigned to this instructor)
  const instructorCourses = courses.filter(
    c =>
      c.instructorId === currentUser.id ||
      c.instructorName === currentUser.name ||
      (currentUser.assignedCourseIds && currentUser.assignedCourseIds.includes(c.id))
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    instructorCourses[0]?.id || ''
  );

  const primaryCourse =
    instructorCourses.find(c => c.id === selectedCourseId) || instructorCourses[0];

  // Grade Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('95');
  const [feedbackInput, setFeedbackInput] = useState<string>(
    'Thorough implementation with clean algorithmic complexity.'
  );

  // Create Assignment Modal State
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [asgCourseId, setAsgCourseId] = useState(primaryCourse?.id || '');
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('2026-11-05');
  const [asgPoints, setAsgPoints] = useState('100');
  const [asgDescription, setAsgDescription] = useState('');

  // Create Lesson Form State
  const [lessonCourseId, setLessonCourseId] = useState(primaryCourse?.id || '');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDate, setLessonDate] = useState('2026-10-21');
  const [lessonTime, setLessonTime] = useState('10:00 AM');
  const [lessonRoom, setLessonRoom] = useState('Turing Hall 304');
  const [lessonType, setLessonType] = useState<Lesson['type']>('Lecture');
  const [lessonObjectives, setLessonObjectives] = useState(
    'Analyze core module principles\nImplement hands-on laboratory application'
  );

  // Upload Material Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [materialCourseId, setMaterialCourseId] = useState(primaryCourse?.id || '');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<'document' | 'video' | 'youtube'>('document');
  const [materialUrl, setMaterialUrl] = useState('');

  // Send Project State
  const [isSendProjectModalOpen, setIsSendProjectModalOpen] = useState(false);
  const [projectTargetCourseId, setProjectTargetCourseId] = useState<string>(primaryCourse?.id || '');

  const handleOpenSendProject = (courseId?: string) => {
    if (courseId) {
      setProjectTargetCourseId(courseId);
      setSelectedCourseId(courseId);
    }
    setIsSendProjectModalOpen(true);
  };

  const handleOpenLessonModal = (courseId?: string) => {
    if (courseId) {
      setLessonCourseId(courseId);
      setSelectedCourseId(courseId);
    }
    setIsCreateLessonModalOpen(true);
  };

  // Handle Create Lesson
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    const targetCourse = courses.find(c => c.id === (lessonCourseId || primaryCourse?.id));

    createLesson({
      courseId: targetCourse?.id || 'crs-general',
      courseCode: targetCourse?.code || 'GEN-101',
      courseTitle: targetCourse?.title || 'General Curriculum Session',
      title: lessonTitle,
      date: lessonDate,
      time: lessonTime,
      durationMinutes: 90,
      room: lessonRoom,
      type: lessonType,
      learningObjectives: lessonObjectives.split('\n').filter(s => s.trim().length > 0),
      materials: [
        { name: `${lessonTitle.replace(/\s+/g, '_')}_Slides.pdf`, type: 'PDF', size: '2.4 MB' }
      ]
    });

    setLessonTitle('');
    setIsCreateLessonModalOpen(false);
  };

  // Handle Create Assignment
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) return;

    const targetCourse = courses.find(c => c.id === (asgCourseId || primaryCourse?.id));

    createAssignment({
      courseId: targetCourse?.id || 'crs-general',
      courseCode: targetCourse?.code || 'GEN-101',
      courseTitle: targetCourse?.title || 'General Academic Cohort',
      title: asgTitle,
      dueDate: asgDueDate,
      totalPoints: parseInt(asgPoints) || 100,
      totalStudents: targetCourse?.enrolledCount || 0,
      description: asgDescription || 'Review complete syllabus objectives and submit notebook before deadline.'
    });

    setAsgTitle('');
    setAsgDescription('');
    setIsCreateAssignmentOpen(false);
  };

  // Handle Material Upload (Document, Video, YouTube link)
  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim()) return;

    const targetCourseId = materialCourseId || primaryCourse?.id;
    if (!targetCourseId) return;

    const newMat: CourseMaterial = {
      id: `mat-${Date.now()}`,
      courseId: targetCourseId,
      title: materialTitle,
      type: materialType,
      url:
        materialUrl.trim() ||
        (materialType === 'youtube'
          ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          : materialType === 'video'
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          : 'https://example.com/document.pdf'),
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    addCourseMaterial(newMat);
    setMaterialTitle('');
    setMaterialUrl('');
    setIsUploadModalOpen(false);
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

  const instructorCourseIds = instructorCourses.map(c => c.id);
  const instructorCourseCodes = instructorCourses.map(c => c.code);
  const totalStudentsInAssignedCourses = instructorCourses.reduce(
    (acc, c) => acc + (c.enrolledCount || 0),
    0
  );
  const instructorAttendance = attendanceRoster.filter(
    att =>
      instructorCourseIds.includes(att.courseId) ||
      instructorCourseCodes.includes(att.courseCode)
  );

  const pendingSubmissions = submissions.filter(s =>
    s.status === 'pending' && instructorCourseIds.includes(s.courseId)
  );
  const presentCount = instructorAttendance.filter(r => r.status === 'present').length;
  const attendanceRate = instructorAttendance.length > 0
    ? Math.round((presentCount / instructorAttendance.length) * 100)
    : 100;

  // Filter lessons, assignments, and submissions to instructor's courses
  const instructorLessons = lessons.filter(l => instructorCourseIds.includes(l.courseId));
  const instructorAssignments = assignments.filter(a => instructorCourseIds.includes(a.courseId));
  const instructorSubmissions = submissions.filter(s => instructorCourseIds.includes(s.courseId));

  return (
    <div className="space-y-6">
      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Award className="w-3.5 h-3.5" />
                  <span>Faculty Academic Console • Assigned Curriculum</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
                  Welcome, {currentUser.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {currentUser.department} • Faculty ID:{' '}
                  <span className="font-mono text-red-300">{currentUser.facultyId}</span> •{' '}
                  <span className="text-emerald-300 font-semibold">{instructorCourses.length} Assigned Courses</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleOpenSendProject(primaryCourse?.id)}
                  id="instructor-send-project-banner-btn"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center shadow-xs cursor-pointer"
                >
                  <FolderGit2 className="w-3.5 h-3.5 mr-1.5" />
                  Send Project
                </button>
                <button
                  onClick={() => setActiveTab('my_classes')}
                  id="instructor-view-classes-banner-btn"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all flex items-center shadow-xs cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
                  Teaching Classes
                </button>
                <button
                  onClick={() => setActiveTab('class_rosters')}
                  id="instructor-view-rosters-banner-btn"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all flex items-center shadow-xs cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                  Class Rosters
                </button>
                <button
                  onClick={() => setIsCreateLessonModalOpen(true)}
                  id="instructor-schedule-lesson-btn"
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
                >
                  <CalendarPlus className="w-3.5 h-3.5 mr-1.5 text-white" />
                  Plan Lesson
                </button>
              </div>
            </div>
          </div>

          {/* Assigned Courses Selector Bar */}
          {instructorCourses.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Courses Assigned to Your Faculty Profile
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Only courses assigned to you by the Institute Academic Administration will appear here. Please coordinate with Administration to receive your course allocations.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Course:
                </span>
                <div className="flex flex-wrap gap-2">
                  {instructorCourses.map(crs => (
                    <button
                      key={crs.id}
                      onClick={() => setSelectedCourseId(crs.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        (primaryCourse?.id === crs.id)
                          ? 'bg-[#1e3a8a] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {crs.code} - {crs.title}
                    </button>
                  ))}
                </div>
              </div>

              {primaryCourse && (
                <button
                  onClick={() => openClassroom(primaryCourse.id)}
                  className="px-3.5 py-1.5 bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold hover:bg-[#1e3a8a]/90 flex items-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Launch Standalone Classroom</span>
                </button>
              )}
            </div>
          )}

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Assigned Classes
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                {instructorCourses.length}
              </p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                Designated Curricula
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Students
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                {totalStudentsInAssignedCourses}
              </p>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block mt-1">
                Across Assigned Classes
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Pending Submissions
              </span>
              <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1 font-mono">
                {pendingSubmissions.length}
              </p>
              <button
                onClick={() => setActiveTab('assignments')}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold block mt-1"
              >
                Review Gradebook &rarr;
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Cohort Attendance
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                {attendanceRate}%
              </p>
              <span className="text-[11px] text-slate-500 block mt-1">
                {instructorAttendance.length} Tracked Entries
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 lg:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Course Materials
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                {primaryCourse?.materials?.length || 0}
              </p>
              <span className="text-[11px] text-slate-500 block mt-1">
                Documents & Videos
              </span>
            </div>
          </div>

          {/* Quick Hub: Teaching Classes, Projects, Rosters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('my_classes')}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  Teaching Multiple Classes
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Manage curricula across your {instructorCourses.length} assigned classes. Check physical classrooms, virtual links, and capacities.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Open Classes Console</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('projects')}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                  Send &amp; Track Projects
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dispatch capstones, term projects, and code repositories. Automatically notify students via email upon assignment.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                <span>Manage Coursework Projects</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('class_rosters')}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  Student Rosters Per Class
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Inspect student lists by class. Review learning modes (Online or On-site), scholarship statuses, and dispatch academic notes.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>View Class Rosters</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Two-Column: Scheduled Lessons Queue & Pending Submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scheduled Lessons */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Upcoming Scheduled Lessons
                  </h3>
                  <p className="text-xs text-slate-500">Curriculum lecture calendar and syllabi</p>
                </div>
                <button
                  onClick={() => setIsCreateLessonModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Lesson
                </button>
              </div>

              <div className="space-y-3">
                {instructorLessons.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                    <CalendarPlus className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No Lessons Scheduled
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Schedule your first lecture session using the button above.
                    </p>
                  </div>
                ) : (
                  instructorLessons.slice(0, 3).map(les => (
                    <div
                      key={les.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300">
                          {les.type} • {les.courseCode}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {les.date} @ {les.time}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{les.title}</h4>
                      <p className="text-[11px] text-slate-500">Room: {les.room} • Duration: {les.durationMinutes}m</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Submissions Requiring Grading */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Submissions Queue
                  </h3>
                  <p className="text-xs text-slate-500">Student deliverables waiting for evaluation</p>
                </div>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {instructorSubmissions.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                    <FileText className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No Submissions in Queue
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Student deliverables will appear here as coursework is turned in.
                    </p>
                  </div>
                ) : (
                  instructorSubmissions.slice(0, 3).map(sub => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={sub.studentAvatar}
                          alt={sub.studentName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {sub.studentName}
                          </h4>
                          <p className="text-[11px] text-slate-500">Submitted: {sub.submittedAt}</p>
                          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                            {sub.fileAttachment}
                          </span>
                        </div>
                      </div>

                      <div>
                        {sub.status === 'graded' ? (
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                              {sub.score} / {sub.maxScore}
                            </span>
                            <span className="block text-[10px] text-slate-400">Graded</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setGradeInput('94');
                              setFeedbackInput('Great architecture and unit tests.');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-xs"
                          >
                            Grade Paper
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Lesson Scheduler */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                Lesson Planner & Scheduler
              </h2>
              <p className="text-xs text-slate-500">
                Plan curriculum lectures and workshops for your assigned courses
              </p>
            </div>

            <button
              onClick={() => setIsCreateLessonModalOpen(true)}
              id="open-lesson-planner-btn"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Schedule New Lecture
            </button>
          </div>

          {instructorLessons.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <CalendarPlus className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Lectures Scheduled
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No lecture sessions have been planned for your courses yet. Use the button above to schedule your next session.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {instructorLessons.map(les => (
                <div
                  key={les.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300">
                        {les.courseCode}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {les.date} @ {les.time}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {les.title}
                    </h3>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div>Room: {les.room}</div>
                      <div>Duration: {les.durationMinutes} minutes</div>
                      <div>Type: {les.type}</div>
                    </div>

                    {les.learningObjectives && les.learningObjectives.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                          Objectives:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                          {les.learningObjectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Assignments & Grading */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Assignments & Grading Console
              </h2>
              <p className="text-xs text-slate-500">
                Manage deliverables, set deadlines, and grade student submissions
              </p>
            </div>

            <button
              onClick={() => setIsCreateAssignmentOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Assignment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instructorAssignments.map(asg => (
              <div
                key={asg.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300">
                    {asg.courseCode}
                  </span>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Due: {asg.dueDate}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{asg.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {asg.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Points: {asg.totalPoints}</span>
                  <span>Students: {asg.totalStudents}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Submissions list */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Student Submissions
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Attachment</th>
                    <th className="py-2.5 px-3">Submitted</th>
                    <th className="py-2.5 px-3 text-center">Score</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {instructorSubmissions.map(sub => (
                    <tr key={sub.id}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{sub.studentName}</div>
                        <div className="text-[11px] text-slate-400">{sub.studentId}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-600 dark:text-blue-400">{sub.fileAttachment}</td>
                      <td className="py-3 px-3">{sub.submittedAt}</td>
                      <td className="py-3 px-3 text-center font-bold">
                        {sub.score !== undefined ? `${sub.score}/${sub.maxScore}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {sub.status === 'graded' ? 'Graded' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setGradeInput(sub.score ? String(sub.score) : '94');
                            setFeedbackInput(sub.feedback || 'Well prepared submission.');
                          }}
                          className="px-3 py-1 bg-[#1e3a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#1e3a8a]/90"
                        >
                          Grade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Course Materials & File Uploads (Documents, Videos, YouTube links) */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                Course Materials & Multimedia Uploads
              </h2>
              <p className="text-xs text-slate-500">
                Upload lecture slides, PDF documents, instructional videos, and YouTube lecture links for your assigned courses
              </p>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold hover:bg-[#1e3a8a]/90 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload New Material
            </button>
          </div>

          {/* Assigned Courses Selector */}
          <div className="flex gap-2 pb-2 overflow-x-auto">
            {instructorCourses.map(crs => (
              <button
                key={crs.id}
                onClick={() => setSelectedCourseId(crs.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  primaryCourse?.id === crs.id
                    ? 'bg-[#1e3a8a] text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {crs.code} - {crs.title}
              </button>
            ))}
          </div>

          {/* Materials Grid for selected course */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Resources for {primaryCourse?.code}: {primaryCourse?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {primaryCourse?.materials?.length || 0} files currently accessible to enrolled students
                </p>
              </div>
            </div>

            {(!primaryCourse?.materials || primaryCourse.materials.length === 0) ? (
              <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Materials Uploaded Yet
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload syllabus PDFs, lecture slides, video demonstrations, or YouTube links for this course.
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-2 px-3 py-1.5 bg-[#1e3a8a] text-white text-xs font-semibold rounded-lg hover:bg-[#1e3a8a]/90"
                >
                  Upload First Resource
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {primaryCourse.materials.map(mat => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          mat.type === 'youtube'
                            ? 'bg-red-100 text-red-700'
                            : mat.type === 'video'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {mat.type}
                        </span>
                        <span className="text-[11px] text-slate-400">{mat.uploadedAt}</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                        {mat.title}
                      </h4>

                      <p className="text-[11px] font-mono text-slate-500 truncate" title={mat.url}>
                        {mat.url}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <a
                          href={mat.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-[#1e3a8a] dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </a>
                        <a
                          href={mat.url}
                          download={mat.title}
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          title="Download Resource"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                      <button
                        onClick={() => deleteCourseMaterial(mat.id, primaryCourse.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Attendance & Progress */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Cohort Attendance & Roster Check
              </h2>
              <p className="text-xs text-slate-500">
                Log attendance records and track student participation thresholds
              </p>
            </div>

            <button
              onClick={() => markAllAttendance('present')}
              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm"
            >
              Mark All Present
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            {instructorAttendance.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Attendance Records for Assigned Classes</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Once students are enrolled in your designated courses, their roster attendance records will display here for logging.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Student ID</th>
                      <th className="py-2.5 px-3">Course Code</th>
                      <th className="py-2.5 px-3">Attendance Rate</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {instructorAttendance.map(att => (
                      <tr key={att.id}>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{att.studentName}</td>
                        <td className="py-3 px-3 font-mono text-slate-400">{att.studentId}</td>
                        <td className="py-3 px-3 font-mono text-blue-600 dark:text-blue-400">{att.courseCode}</td>
                        <td className="py-3 px-3">{att.attendancePercent}%</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() =>
                              updateAttendance(
                                att.id,
                                att.status === 'present'
                                  ? 'absent'
                                  : att.status === 'absent'
                                  ? 'excused'
                                  : 'present'
                              )
                            }
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              att.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.status === 'absent'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {att.status}
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

      {/* Tab: Teaching Classes */}
      {activeTab === 'my_classes' && (
        <InstructorTeachingClasses
          selectedCourseId={selectedCourseId}
          onSelectClass={id => setSelectedCourseId(id)}
          onNavigateToTab={(tab, courseId) => {
            if (courseId) setSelectedCourseId(courseId);
            setActiveTab(tab);
          }}
          onOpenSendProjectModal={id => handleOpenSendProject(id)}
          onOpenLessonModal={id => handleOpenLessonModal(id)}
        />
      )}

      {/* Tab: Projects & Deliverables */}
      {activeTab === 'projects' && (
        <InstructorProjectsPage
          isSendProjectModalOpen={isSendProjectModalOpen}
          setIsSendProjectModalOpen={setIsSendProjectModalOpen}
          preselectedCourseId={projectTargetCourseId || selectedCourseId}
        />
      )}

      {/* Tab: Student Rosters Per Class */}
      {activeTab === 'class_rosters' && (
        <InstructorClassRosters
          preselectedCourseId={selectedCourseId}
          onSelectClass={id => setSelectedCourseId(id)}
        />
      )}

      {/* Modal: Schedule Lesson */}
      {isCreateLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Schedule Curriculum Lecture
              </h3>
              <button
                onClick={() => setIsCreateLessonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assign to Course *
                </label>
                <select
                  value={lessonCourseId}
                  onChange={e => setLessonCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {instructorCourses.map(crs => (
                    <option key={crs.id} value={crs.id}>
                      {crs.code} - {crs.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Computing and Consensus"
                  value={lessonTitle}
                  onChange={e => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={lessonDate}
                    onChange={e => setLessonDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    value={lessonTime}
                    onChange={e => setLessonTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Venue / Classroom
                  </label>
                  <input
                    type="text"
                    value={lessonRoom}
                    onChange={e => setLessonRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Session Format
                  </label>
                  <select
                    value={lessonType}
                    onChange={e => setLessonType(e.target.value as Lesson['type'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab Workshop">Lab Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Office Hours">Office Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Learning Objectives (one per line)
                </label>
                <textarea
                  rows={3}
                  value={lessonObjectives}
                  onChange={e => setLessonObjectives(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateLessonModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg font-semibold hover:bg-[#1e3a8a]/90"
                >
                  Schedule Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Assignment */}
      {isCreateAssignmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Create Course Assignment
              </h3>
              <button
                onClick={() => setIsCreateAssignmentOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assign to Course *
                </label>
                <select
                  value={asgCourseId}
                  onChange={e => setAsgCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {instructorCourses.map(crs => (
                    <option key={crs.id} value={crs.id}>
                      {crs.code} - {crs.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Problem Set 2"
                  value={asgTitle}
                  onChange={e => setAsgTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={asgDueDate}
                    onChange={e => setAsgDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Total Points *
                  </label>
                  <input
                    type="number"
                    value={asgPoints}
                    onChange={e => setAsgPoints(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Submission Instructions & Rubric
                </label>
                <textarea
                  rows={3}
                  value={asgDescription}
                  onChange={e => setAsgDescription(e.target.value)}
                  placeholder="Guidelines, code requirements, and submission formats..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAssignmentOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg font-semibold hover:bg-[#1e3a8a]/90"
                >
                  Post Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Resource (Document, Video, YouTube Link) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Upload Course Resource
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Assigned Course *
                </label>
                <select
                  value={materialCourseId}
                  onChange={e => setMaterialCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {instructorCourses.map(crs => (
                    <option key={crs.id} value={crs.id}>
                      {crs.code} - {crs.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Lecture Slides / Workshop Demo"
                  value={materialTitle}
                  onChange={e => setMaterialTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Material Format *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMaterialType('document')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      materialType === 'document'
                        ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialType('video')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      materialType === 'video'
                        ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialType('youtube')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      materialType === 'youtube'
                        ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube Link</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {materialType === 'youtube'
                    ? 'YouTube Video URL *'
                    : materialType === 'video'
                    ? 'Video File URL / Storage Link *'
                    : 'Document URL / Cloud Link *'}
                </label>
                <input
                  type="text"
                  placeholder={
                    materialType === 'youtube'
                      ? 'https://www.youtube.com/watch?v=...'
                      : 'https://...'
                  }
                  value={materialUrl}
                  onChange={e => setMaterialUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg font-semibold hover:bg-[#1e3a8a]/90"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Grade Submission */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Grade Student Submission
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSubmission.studentName} ({selectedSubmission.studentId})
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Deliverable File</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedSubmission.fileAttachment || 'Paper_Archive.zip'}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Score Awarded (Max: {selectedSubmission.maxScore} pts)
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
                  Qualitative Professor Feedback & Comments
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
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1e3a8a] text-white font-semibold hover:bg-[#1e3a8a]/90 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save Grade & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
