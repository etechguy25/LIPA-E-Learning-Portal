import React, { useState, useRef } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Award,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  Camera,
  Image as ImageIcon,
  Key,
  Lock,
  Sparkles,
  ShieldCheck,
  Check,
  Building,
  UserCheck,
  CalendarDays,
  Upload,
  Trash2,
  X
} from 'lucide-react';
import { ScheduleEvent } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { StudentAssignmentsTab } from './StudentAssignmentsTab';
import { StudentProgressVisualization } from './StudentProgressVisualization';

interface StudentDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    courses,
    studentProgress,
    scheduleEvents,
    gradesSummary,
    tuitionStatement,
    transactions,
    assignments,
    submissions,
    openPaymentModal,
    openReceiptModal,
    openClassroom,
    updateStudentProfile,
    setPassword,
    settings
  } = useLms();

  // Filter courses so student ONLY sees courses they have been assigned by administrator
  const assignedCourses = courses.filter(c =>
    (currentUser.assignedCourseIds && currentUser.assignedCourseIds.includes(c.id)) ||
    (currentUser.selectedCourseId === c.id)
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    assignedCourses[0]?.id || ''
  );
  const [scheduleFilterDay, setScheduleFilterDay] = useState<string>('All');

  // Profile Customization States (Direct Device File Upload)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Avatar device file upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Cover photo device file upload state
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const activeCourse = assignedCourses.find(c => c.id === selectedCourseId) || assignedCourses[0];

  // Device file upload handler for Profile Avatar
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image file size must be less than 5MB.');
      return;
    }
    setAvatarError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = () => {
    if (avatarPreview) {
      updateStudentProfile({ avatar: avatarPreview });
      setIsAvatarModalOpen(false);
      setAvatarPreview(null);
      setAvatarError(null);
    }
  };

  const handleRemoveAvatar = () => {
    updateStudentProfile({ avatar: '' });
    setAvatarPreview(null);
    setAvatarError(null);
    setIsAvatarModalOpen(false);
  };

  // Device file upload handler for Cover Photo
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCoverError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setCoverError('Cover photo size must be less than 8MB.');
      return;
    }
    setCoverError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCoverPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCover = () => {
    if (coverPreview) {
      updateStudentProfile({ coverPhoto: coverPreview });
      setIsCoverModalOpen(false);
      setCoverPreview(null);
      setCoverError(null);
    }
  };

  const handleRemoveCover = () => {
    updateStudentProfile({ coverPhoto: '' });
    setCoverPreview(null);
    setCoverError(null);
    setIsCoverModalOpen(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPassword(newPassword);
    setPasswordError('');
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  // Filter schedule events to only assigned courses
  const assignedCourseIds = assignedCourses.map(c => c.id);
  const studentScheduleEvents = scheduleEvents.filter(
    e => assignedCourseIds.includes(e.courseId)
  );

  const filteredSchedule =
    scheduleFilterDay === 'All'
      ? studentScheduleEvents
      : studentScheduleEvents.filter(e => e.day === scheduleFilterDay);

  // Collect upcoming assignments for student's assigned courses
  const studentAssignments = assignments.filter(a =>
    assignedCourseIds.includes(a.courseId)
  );

  // Overall student progress calculation
  const overallProgress =
    studentProgress.length > 0
      ? Math.round(
          studentProgress.reduce((acc, sp) => acc + sp.progressPercent, 0) /
            studentProgress.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Password Setup Alert Banner if not established */}
      {currentUser.passwordSet === false && (
        <div className="bg-red-500/15 border border-red-500/40 dark:border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-900 dark:text-red-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Action Required: Establish Student Account Password</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your account was enrolled by administration. Please configure your secret portal password for multi-device login.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-4 py-2 bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold hover:bg-[#1e3a8a]/90 transition-colors shrink-0 shadow-sm"
          >
            Setup Password Now
          </button>
        </div>
      )}

      {/* Profile Header with Cover Photo and Avatar Customization */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cover Photo Area */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-900 overflow-hidden">
          {currentUser.coverPhoto ? (
            <img
              src={currentUser.coverPhoto}
              alt="Campus Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-[#1e3a8a]/70 to-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs px-4">
              <span className="font-semibold text-slate-200">No Custom Cover Photo Uploaded</span>
              <span className="text-[11px] text-slate-400 mt-1">Upload a banner image from your device to personalize your student profile.</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

          {/* Change Cover Photo Trigger */}
          <button
            onClick={() => {
              setCoverPreview(null);
              setCoverError(null);
              setIsCoverModalOpen(true);
            }}
            id="student-update-cover-btn"
            className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 shadow-xs cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{currentUser.coverPhoto ? 'Change Cover Photo' : 'Upload Cover Photo'}</span>
          </button>
        </div>

        {/* Profile Info Bar */}
        <div className="p-6 pt-0 relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Avatar with Change Photo Trigger */}
            <div className="relative group">
              <UserAvatar
                avatar={currentUser.avatar}
                name={currentUser.name}
                role="student"
                size="xl"
                className="ring-4 ring-white dark:ring-slate-900 shadow-lg"
              />
              <button
                onClick={() => {
                  setAvatarPreview(null);
                  setAvatarError(null);
                  setIsAvatarModalOpen(true);
                }}
                id="student-edit-avatar-btn"
                className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold transition-opacity backdrop-blur-xs cursor-pointer"
                title="Upload Photo from Device"
              >
                <Camera className="w-5 h-5 mb-1 text-white" />
                <span>Upload Photo</span>
              </button>
            </div>

            <div className="space-y-1 mb-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {currentUser.studentId}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {currentUser.major} • {currentUser.academicYear} • {currentUser.department}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                <span>Learning Mode: <strong className="text-slate-700 dark:text-slate-300">{currentUser.learnType || 'In-Person'}</strong></span>
                <span>•</span>
                <span>Term: <strong className="text-slate-700 dark:text-slate-300">{settings.currentTerm}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Password Security</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recharts Analytics: Individual Course Progress & Assignment Completion Rates */}
          <StudentProgressVisualization
            assignedCourses={assignedCourses}
            studentProgress={studentProgress}
            assignments={assignments}
            submissions={submissions}
            studentId={currentUser.id}
          />

          {/* Student Progress Visualization: Completion Status & Upcoming Deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Course Completion Progress Card */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                    Academic Course Completion Status
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live curriculum milestones tracked across all enrolled programs
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Cohort Average:</span>
                  <span className="text-sm font-bold text-[#1e3a8a] dark:text-blue-400 font-mono">
                    {overallProgress}%
                  </span>
                </div>
              </div>

              {assignedCourses.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Courses Assigned</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You have not been assigned to any course yet. Course enrollment is managed exclusively by the Institute Academic Administration.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedCourses.map(crs => {
                    const prog = studentProgress.find(p => p.courseId === crs.id);
                    const percent = prog ? prog.progressPercent : 20;

                    return (
                      <div
                        key={crs.id}
                        className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300">
                              {crs.code}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {crs.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                              {percent}% Completed
                            </span>
                            <button
                              onClick={() => openClassroom(crs.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#1e3a8a] text-white rounded-md hover:bg-[#1e3a8a]/90 transition-colors"
                            >
                              Enter Classroom
                            </button>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-[#1e3a8a] dark:bg-blue-500 h-2.5 rounded-full transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                          <span>Instructor: <strong className="text-slate-700 dark:text-slate-300">{crs.instructorName}</strong></span>
                          <span>Next: {prog?.nextMilestone || 'Module 1 Foundations'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines Progress Tracker */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    Upcoming Deadlines
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {studentAssignments.length} Deliverables
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Submission milestones for your assigned courses
                </p>

                <div className="mt-4 space-y-3">
                  {studentAssignments.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold">No Pending Deliverables</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        You have no outstanding assignments due this week.
                      </p>
                    </div>
                  ) : (
                    studentAssignments.map(asg => (
                      <div
                        key={asg.id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                            {asg.title}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300">
                            {asg.totalPoints} pts
                          </span>
                        </div>

                        {/* Deadline Progress Bar */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                            <span>Due: {asg.dueDate}</span>
                            <span className="font-medium text-[#1e3a8a] dark:text-blue-400">
                              {asg.courseCode}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-red-500 h-1.5 rounded-full"
                              style={{ width: '65%' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center"
                >
                  View Full Academic Calendar
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Enrolled Courses Standalone Classrooms Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  My Assigned Classrooms
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your dedicated standalone classroom environment for each enrolled course
                </p>
              </div>
            </div>

            {assignedCourses.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Academic Courses Assigned
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Student enrollment is strictly administered by the Institute. Once an administrator assigns courses to your profile, each course will appear here with its standalone classroom environment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assignedCourses.map(crs => {
                  const prog = studentProgress.find(p => p.courseId === crs.id);
                  const percent = prog ? prog.progressPercent : 20;

                  return (
                    <div
                      key={crs.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            {crs.code}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {crs.mode || 'In-Person'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                          {crs.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {crs.description}
                        </p>

                        <div className="pt-2 text-xs space-y-1 text-slate-500">
                          <div className="flex items-center justify-between">
                            <span>Instructor:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{crs.instructorName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Room:</span>
                            <span>{crs.room || 'Academic Hall 101'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Duration:</span>
                            <span>{crs.duration || '12 Weeks'}</span>
                          </div>
                        </div>

                        {/* Completion progress bar */}
                        <div className="pt-2">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Course Progress</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#1e3a8a] dark:bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => openClassroom(crs.id)}
                        className="w-full py-2.5 px-4 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Enter Standalone Classroom</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Enrolled Courses & Standalone Classroom list */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Assigned Academic Courses
              </h2>
              <p className="text-xs text-slate-500">
                Course enrollments assigned exclusively by administration
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300">
              {assignedCourses.length} Active Enrollment(s)
            </span>
          </div>

          {assignedCourses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Courses Assigned
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Students cannot self-enroll. All courses are officially assigned by the Institute Registrar and Academic Administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedCourses.map(crs => {
                const prog = studentProgress.find(p => p.courseId === crs.id);
                return (
                  <div
                    key={crs.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300">
                          {crs.code}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {crs.credits} Credits
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {crs.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {crs.description}
                      </p>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                        <div className="text-slate-500">Faculty: <strong className="text-slate-800 dark:text-slate-200">{crs.instructorName}</strong></div>
                        <div className="text-slate-500">Schedule: {crs.schedule}</div>
                        <div className="text-slate-500">Format: {crs.mode || 'In-Person'} ({crs.duration || '12 Weeks'})</div>
                      </div>

                      {/* Course Completion Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Syllabus Completion</span>
                          <span className="font-bold text-[#1e3a8a] dark:text-blue-400">
                            {prog?.progressPercent || 20}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#1e3a8a] dark:bg-blue-500 h-2 rounded-full"
                            style={{ width: `${prog?.progressPercent || 20}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openClassroom(crs.id)}
                      className="w-full py-2.5 bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold hover:bg-[#1e3a8a]/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Launch Class Environment</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Class Timetable */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Academic Timetable & Lecture Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Weekly scheduled lectures and faculty office hours for your enrolled courses
              </p>
            </div>
          </div>

          <div className="flex gap-2 pb-2 overflow-x-auto">
            {['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
              <button
                key={day}
                onClick={() => setScheduleFilterDay(day)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  scheduleFilterDay === day
                    ? 'bg-[#1e3a8a] text-white font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchedule.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No lectures scheduled for {scheduleFilterDay}.
              </div>
            ) : (
              filteredSchedule.map(ev => (
                <div
                  key={ev.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-[#1e3a8a] dark:bg-blue-950/60 dark:text-blue-300">
                      {ev.courseCode}
                    </span>
                    <span className="font-semibold text-slate-500">{ev.day} • {ev.startTime} - {ev.endTime}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ev.courseTitle}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Instructor: {ev.instructorName}</span>
                    <span>Venue: {ev.room}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Grades & Academic Transcript */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Official Academic Standing & Transcript
              </h2>
              <p className="text-xs text-slate-500">
                Verified records and cumulative grade evaluations
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Enrolled Course Grades
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Course Code</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-3">Credits</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {assignedCourses.map(crs => {
                    const prog = studentProgress.find(p => p.courseId === crs.id);
                    return (
                      <tr key={crs.id}>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">{crs.code}</td>
                        <td className="py-3 px-3 font-medium">{crs.title}</td>
                        <td className="py-3 px-3">{crs.credits}</td>
                        <td className="py-3 px-3 font-bold text-[#1e3a8a] dark:text-blue-400">
                          {prog?.currentGrade || 'A'}
                        </td>
                        <td className="py-3 px-3 font-mono">{prog?.currentScore || 94}%</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Excellent
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Financial Record */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
                Financial Record &amp; Account Statement
              </h2>
              <p className="text-xs text-slate-500">
                Official tuition schedule, balance owed, and receipt history
              </p>
            </div>
            {((currentUser.balanceOwed ?? tuitionStatement?.balanceDue ?? 0) > 0) && (
              <button
                onClick={openPaymentModal}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
              >
                Pay Outstanding Balance
              </button>
            )}
          </div>

          {(() => {
            const studentTotalDue = currentUser.totalDue ?? tuitionStatement?.totalDue ?? tuitionStatement?.totalTuition ?? 0;
            const studentTotalPaid = currentUser.paidAmount ?? tuitionStatement?.totalPaid ?? 0;
            const studentBalanceDue = currentUser.balanceOwed ?? tuitionStatement?.balanceDue ?? 0;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Due</span>
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                    ${(studentTotalDue || 0).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Assessed course &amp; institutional fees</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Amount Paid</span>
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                    ${(studentTotalPaid || 0).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">Verified cleared remittances</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Balance Owed</span>
                  <span className={`text-2xl font-bold font-mono mt-1 block ${
                    studentBalanceDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    ${(studentBalanceDue || 0).toLocaleString()}
                  </span>
                  <span className={`text-[11px] mt-1 block font-medium ${
                    studentBalanceDue > 0 ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {studentBalanceDue > 0 ? 'Payment required' : 'Fully settled'}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Account Status</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">
                    {studentBalanceDue === 0 ? 'Fully Cleared' : 'Active Balance'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Official Bursar record</span>
                </div>
              </div>
            );
          })()}

          {/* Payment Receipts */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Payment Transactions & Official Receipts
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Receipt #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">{tx.receiptNumber}</td>
                      <td className="py-3 px-3">{tx.date}</td>
                      <td className="py-3 px-3">{tx.category || 'Tuition'}</td>
                      <td className="py-3 px-3">{tx.method}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ${(tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => openReceiptModal(tx)}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 rounded hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" /> View Receipt
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

      {/* Tab: Assignments & Academic Projects */}
      {(activeTab === 'assignments' || activeTab === 'projects') && (
        <StudentAssignmentsTab onOpenClassroom={openClassroom} />
      )}

      {/* Tab: Dedicated Academic Progress Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <StudentProgressVisualization
            assignedCourses={assignedCourses}
            studentProgress={studentProgress}
            assignments={assignments}
            submissions={submissions}
            studentId={currentUser.id}
          />
        </div>
      )}

      {/* Modal: Change Avatar (Upload from Device) */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Upload Profile Photo
              </h3>
              <button
                onClick={() => {
                  setIsAvatarModalOpen(false);
                  setAvatarPreview(null);
                  setAvatarError(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Upload a student portrait directly from your computer or mobile device. JPG, PNG, or WEBP up to 5MB.
              </p>

              <input
                type="file"
                ref={avatarFileInputRef}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleAvatarFileUpload}
              />

              {avatarError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{avatarError}</span>
                </div>
              )}

              {avatarPreview ? (
                <div className="space-y-3">
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-28 h-28 rounded-2xl object-cover ring-4 ring-[#1e3a8a]/20 shadow-md mb-2"
                    />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ready to save
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Choose Different Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAvatar}
                      className="flex-1 py-2 px-3 bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold hover:bg-[#1e3a8a]/90 transition-colors shadow-sm cursor-pointer"
                    >
                      Save to Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1e3a8a] dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Click to choose photo from your device
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      PNG, JPG, or WEBP (Max 5MB)
                    </span>
                  </div>

                  {currentUser.avatar && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={currentUser.avatar}
                          alt="Current avatar"
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          Active Profile Picture
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Cover Photo (Upload from Device) */}
      {isCoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Upload Cover Photo
              </h3>
              <button
                onClick={() => {
                  setIsCoverModalOpen(false);
                  setCoverPreview(null);
                  setCoverError(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Upload a campus or banner image directly from your computer or mobile device. Recommended landscape aspect ratio (16:9), up to 8MB.
              </p>

              <input
                type="file"
                ref={coverFileInputRef}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleCoverFileUpload}
              />

              {coverError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{coverError}</span>
                </div>
              )}

              {coverPreview ? (
                <div className="space-y-3">
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-36 rounded-xl object-cover shadow-sm mb-2"
                    />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ready to save
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Choose Different Banner
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCover}
                      className="flex-1 py-2 px-3 bg-[#1e3a8a] text-white rounded-xl text-xs font-semibold hover:bg-[#1e3a8a]/90 transition-colors shadow-sm cursor-pointer"
                    >
                      Save Cover Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1e3a8a] dark:hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Click to choose banner photo from your device
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      PNG, JPG, or WEBP (Max 8MB)
                    </span>
                  </div>

                  {currentUser.coverPhoto && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={currentUser.coverPhoto}
                          alt="Current cover"
                          className="w-14 h-9 rounded-md object-cover"
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          Active Campus Cover
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Banner</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Setup / Reset Password */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Configure Student Account Password
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            {passwordSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-xs text-emerald-800 dark:text-emerald-200 font-semibold space-y-2">
                <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                <p>Your password has been successfully established.</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                {passwordError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 font-medium">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Secure Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter same password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg font-semibold hover:bg-[#1e3a8a]/90"
                  >
                    Save Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
