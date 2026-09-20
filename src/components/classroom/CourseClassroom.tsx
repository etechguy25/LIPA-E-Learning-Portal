import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Course, CourseMaterial, Lesson, Assignment } from '../../types';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Video,
  Youtube,
  Download,
  ExternalLink,
  CheckCircle2,
  Circle,
  Plus,
  Award,
  UserCheck,
  Building,
  Globe,
  Upload,
  Sparkles,
  AlertCircle,
  Play,
  FileDown,
  Mail,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface CourseClassroomProps {
  courseId: string;
  onBack: () => void;
}

export const CourseClassroom: React.FC<CourseClassroomProps> = ({ courseId, onBack }) => {
  const {
    courses,
    currentUser,
    currentRole,
    studentProgress,
    lessons,
    assignments,
    submissions,
    addCourseMaterial,
    deleteCourseMaterial,
    createLesson,
    createAssignment,
    editCourse
  } = useLms();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'lessons' | 'assignments' | 'materials' | 'grades' | 'instructor' | 'calendar'
  >('overview');

  // Modals for Instructors & Admins
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);

  // Upload Material Form
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<'video' | 'document' | 'youtube' | 'link'>('document');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialFileSize, setMaterialFileSize] = useState('2.4 MB');

  // Add Lesson Form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDate, setLessonDate] = useState('2026-10-14');
  const [lessonTime, setLessonTime] = useState('09:00 AM');
  const [lessonDuration, setLessonDuration] = useState(90);
  const [lessonRoom, setLessonRoom] = useState('Hall 101');
  const [lessonType, setLessonType] = useState<'Lecture' | 'Lab Workshop' | 'Review Session'>('Lecture');
  const [lessonObjectives, setLessonObjectives] = useState('Analyze core institutional paradigms\nReview regional case studies');

  // Add Assignment Form
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('2026-10-25');
  const [asgPoints, setAsgPoints] = useState(100);
  const [asgDescription, setAsgDescription] = useState('');

  // Student Submission state
  const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState('');

  const course = courses.find(c => c.id === courseId);
  const progress = studentProgress.find(p => p.courseId === courseId);

  if (!course) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Classroom Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          The requested course classroom is unavailable or may have been updated by administration.
        </p>
        <button
          onClick={onBack}
          className="mt-6 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a8a]/90 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const courseLessons = lessons.filter(l => l.courseId === course.id);
  const courseAssignments = assignments.filter(a => a.courseId === course.id);
  const courseMaterials: CourseMaterial[] = course.materials || [];

  // Check if current user is the instructor assigned to this course or admin
  const isAuthorizedInstructor =
    currentRole === 'admin' ||
    (currentRole === 'instructor' &&
      (course.instructorId === currentUser.id || currentUser.assignedCourseIds?.includes(course.id)));

  const handleUploadMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim()) return;

    addCourseMaterial({
      courseId: course.id,
      title: materialTitle.trim(),
      type: materialType,
      url: materialUrl.trim() || (materialType === 'youtube' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : '#'),
      description: materialDescription.trim(),
      fileSize: materialType === 'document' || materialType === 'video' ? materialFileSize : undefined
    });

    setMaterialTitle('');
    setMaterialUrl('');
    setMaterialDescription('');
    setIsUploadModalOpen(false);
  };

  const handleAddLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    createLesson({
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      title: lessonTitle.trim(),
      date: lessonDate,
      time: lessonTime,
      durationMinutes: Number(lessonDuration) || 90,
      room: lessonRoom.trim() || 'Academic Hall 101',
      type: lessonType,
      learningObjectives: lessonObjectives.split('\n').filter(o => o.trim() !== ''),
      materials: [
        { name: 'Lecture Slides.pdf', type: 'PDF', size: '2.8 MB' },
        { name: 'Policy Reference Guide.docx', type: 'DOCX', size: '1.2 MB' }
      ]
    });

    setLessonTitle('');
    setIsAddLessonModalOpen(false);
  };

  const handleAddAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) return;

    createAssignment({
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      title: asgTitle.trim(),
      dueDate: asgDueDate,
      totalPoints: Number(asgPoints) || 100,
      totalStudents: course.enrolledCount || 1,
      description: asgDescription.trim() || 'Please submit your comprehensive analytical paper following APA guidelines.'
    });

    setAsgTitle('');
    setAsgDescription('');
    setIsAddAssignmentModalOpen(false);
  };

  const handleStudentSubmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmission) return;

    setSubmissionSuccessMsg(
      `Your submission for "${selectedAssignmentForSubmission.title}" was successfully recorded and submitted for grading.`
    );
    setTimeout(() => {
      setSelectedAssignmentForSubmission(null);
      setSubmissionText('');
      setSubmissionFileName('');
      setSubmissionSuccessMsg('');
    }, 2200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e3a8a] dark:text-blue-400 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {currentRole === 'student' ? 'My Courses' : 'Dashboard'}
        </button>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            {course.code}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {course.mode || 'In-Person'}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {course.duration || '12 Weeks'}
          </span>
        </div>
      </div>

      {/* Course Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a8a] via-[#172554] to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5 text-blue-300" />
            <span>{course.department}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {course.title}
          </h1>

          <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed max-w-3xl">
            {course.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Instructor: <strong className="text-white font-medium">{course.instructorName}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-300" />
              <span>{course.schedule}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-300" />
              <span>{course.room || 'Campus Hall 101'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-red-300" />
              <span>{course.credits} Credit Hours</span>
            </div>
          </div>

          {/* Student Progress Overview inside Classroom */}
          {currentRole === 'student' && progress && (
            <div className="mt-4 pt-4 border-t border-white/15 max-w-xl">
              <div className="flex justify-between items-center text-xs text-blue-100 mb-1.5">
                <span className="font-semibold">Your Course Progress</span>
                <span className="font-bold text-white">{progress.progressPercent}% Completed</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress.progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Classroom Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm flex flex-wrap gap-1">
        {[
          { id: 'overview', label: 'Overview & Syllabus', icon: BookOpen },
          { id: 'lessons', label: `Lessons (${courseLessons.length})`, icon: Clock },
          { id: 'assignments', label: `Assignments (${courseAssignments.length})`, icon: FileText },
          { id: 'materials', label: `Materials & Media (${courseMaterials.length})`, icon: Video },
          { id: 'grades', label: 'Course Grades', icon: Award },
          { id: 'instructor', label: 'Instructor Profile', icon: UserCheck },
          { id: 'calendar', label: 'Class Timetable', icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1e3a8a] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Syllabus */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Course Curriculum & Modules
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The curriculum is structured across progressive modules designed to prepare candidates for executive public service and modern administrative leadership.
              </p>

              <div className="space-y-3 pt-2">
                {(course.syllabusModules || []).map((mod, idx) => (
                  <div
                    key={mod.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {mod.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : mod.status === 'in-progress' ? (
                            <Sparkles className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300">
                              Week {mod.week}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {mod.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                        {mod.durationMinutes} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Standalone Class Environment Details */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Delivery Mode: {course.mode || 'In-Person'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {course.mode === 'Online'
                  ? 'This classroom conducts digital live lectures through high-definition encrypted conferencing. Real-time chat, screen sharing, and recorded playback archives are integrated directly into your student portal.'
                  : course.mode === 'Hybrid'
                  ? 'This hybrid program merges on-campus seminars at LIPA Main Campus with flexible remote digital workshops and collaborative online discussion forums.'
                  : 'Traditional on-campus lecture and seminar delivery in dedicated Institute lecture halls with access to campus computing labs and academic libraries.'}
              </p>
            </div>
          </div>

          {/* Quick Classroom Facts */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Classroom Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Course Code:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{course.code}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Academic Credits:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{course.credits}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Delivery Format:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{course.mode || 'In-Person'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Scheduled Duration:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{course.duration || '12 Weeks'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Meeting Room:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{course.room || 'Academic Hall 101'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Enrolled Students:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{course.enrolledCount} Candidate(s)</span>
                </div>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Instructor</h3>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-sm">
                  {course.instructorName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{course.instructorName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{course.department}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                For questions regarding syllabus, assignments, or consultations, reach out during scheduled faculty office hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Lessons & Lectures */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Lecture Timetable & Lesson Plans
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                All planned lectures, session objectives, and workshop schedules.
              </p>
            </div>

            {isAuthorizedInstructor && (
              <button
                onClick={() => setIsAddLessonModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#1e3a8a]/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Plan New Lecture
              </button>
            )}
          </div>

          {courseLessons.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Lessons Planned Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                The instructor has not posted any lesson schedules yet for this semester.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseLessons.map(lesson => (
                <div
                  key={lesson.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300">
                      {lesson.type}
                    </span>
                    <span className="text-xs text-slate-500">{lesson.date}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {lesson.title}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1e3a8a]" />
                      {lesson.time} ({lesson.durationMinutes} min)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#1e3a8a]" />
                      {lesson.room}
                    </span>
                  </div>

                  {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Objectives:
                      </span>
                      <ul className="space-y-1">
                        {lesson.learningObjectives.map((obj, i) => (
                          <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Assignments & Submissions */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Coursework & Assignments
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Review assigned research papers, problem sets, and submit deliverables.
              </p>
            </div>

            {isAuthorizedInstructor && (
              <button
                onClick={() => setIsAddAssignmentModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#1e3a8a]/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Assignment
              </button>
            )}
          </div>

          {courseAssignments.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Assignments Posted</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                There are no active or past assignments published for this course yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courseAssignments.map(asg => {
                const submission = submissions.find(
                  s => s.assignmentId === asg.id && (s.studentId === currentUser.studentId || s.studentId === currentUser.id)
                );

                return (
                  <div
                    key={asg.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                          {asg.totalPoints} Points
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {asg.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Due: {asg.dueDate}
                        </span>
                        {submission ? (
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {submission.status === 'graded' ? `Graded: ${submission.score}/${submission.maxScore}` : 'Submitted'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                            Pending Submission
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {asg.description}
                    </p>

                    {currentRole === 'student' && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setSelectedAssignmentForSubmission(asg)}
                          className="px-3.5 py-1.5 bg-[#1e3a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#1e3a8a]/90 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {submission ? 'Resubmit Assignment' : 'Upload Submission'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Materials & Media Hub (Videos, Docs, YouTube links) */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Materials & Digital Media Hub
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Access lecture recordings, documents, and YouTube educational materials.
              </p>
            </div>

            {isAuthorizedInstructor && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#1e3a8a]/90 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Upload Course Material
              </button>
            )}
          </div>

          {courseMaterials.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Video className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Course Materials Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                The instructor has not uploaded any video lectures or reading materials for this course yet.
              </p>
              {isAuthorizedInstructor && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1e3a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#1e3a8a]/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Upload First Resource
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courseMaterials.map(mat => (
                <div
                  key={mat.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 ${
                        mat.type === 'youtube'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : mat.type === 'video'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'bg-blue-50 text-[#1e3a8a] dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {mat.type === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-600" />}
                        {mat.type === 'video' && <Video className="w-3.5 h-3.5 text-purple-600" />}
                        {mat.type === 'document' && <FileText className="w-3.5 h-3.5 text-blue-600" />}
                        {mat.type === 'link' && <ExternalLink className="w-3.5 h-3.5 text-blue-600" />}
                        {mat.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">{mat.uploadedAt}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {mat.title}
                    </h4>

                    {mat.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {mat.description}
                      </p>
                    )}

                    {/* YouTube Preview Embed if link is YouTube */}
                    {mat.type === 'youtube' && (
                      <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden relative flex items-center justify-center">
                        <div className="text-center p-3">
                          <Youtube className="w-8 h-8 text-red-500 mx-auto mb-1" />
                          <span className="text-[11px] text-slate-300 font-medium">YouTube Video Resource</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{mat.fileSize || 'Online Stream'}</span>
                    <div className="flex items-center gap-2">
                      {isAuthorizedInstructor && (
                        <button
                          onClick={() => deleteCourseMaterial(mat.id, course.id)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold px-2 py-1"
                        >
                          Remove
                        </button>
                      )}
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-[#1e3a8a] text-white rounded text-xs font-medium hover:bg-[#1e3a8a]/90 transition-colors inline-flex items-center gap-1"
                      >
                        {mat.type === 'document' ? <Download className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {mat.type === 'document' ? 'Download' : 'Watch'}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Course Grades */}
      {activeTab === 'grades' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-red-600 dark:text-red-400" />
              Academic Grade Standing
            </h3>
            {progress && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs">
                Current Grade: {progress.currentGrade} ({progress.currentScore}%)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Assessment scores, rubric weights, and feedback on all completed assignments.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Item / Deliverable</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Max Score</th>
                  <th className="py-2.5 px-3">Earned Score</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {courseAssignments.map(asg => {
                  const sub = submissions.find(s => s.assignmentId === asg.id);
                  return (
                    <tr key={asg.id}>
                      <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{asg.title}</td>
                      <td className="py-3 px-3">{asg.dueDate}</td>
                      <td className="py-3 px-3">25%</td>
                      <td className="py-3 px-3">{asg.totalPoints}</td>
                      <td className="py-3 px-3 font-semibold text-[#1e3a8a] dark:text-blue-400">
                        {sub?.score !== undefined ? sub.score : '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300">
                          {sub?.status || 'Scheduled'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Instructor Profile */}
      {activeTab === 'instructor' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xl">
              {course.instructorName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{course.instructorName}</h3>
              <p className="text-xs text-slate-500">{course.department}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-[#1e3a8a] dark:bg-blue-950/60 dark:text-blue-300">
                Senior Academic Faculty
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Academic Faculty Credentials</h4>
            <p>
              Appointed to the Liberia Institute of Public Administration Faculty Council, leading theoretical and field initiatives in administrative science, institutional governance, and public policy formulation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Faculty Email:</span>
                <span className="font-semibold text-slate-900 dark:text-white">faculty@lipa.edu.lr</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Consultation Hours:</span>
                <span className="font-semibold text-slate-900 dark:text-white">Mon & Wed, 2:00 PM - 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Class Timetable */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
            Class Meeting Timetable & Deadlines
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider block">
                Primary Weekly Lecture
              </span>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{course.schedule}</div>
              <div className="text-slate-500">Venue: {course.room || 'Hall 101'}</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Office Consultation
              </span>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">Wednesdays, 2:00 PM - 4:00 PM</div>
              <div className="text-slate-500">Faculty Office 204 or Virtual Link</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                Scheduled Duration
              </span>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{course.duration || '12 Weeks Program'}</div>
              <div className="text-slate-500">Term: Fall Academic Semester 2026</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Course Material */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Upload Course Material
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadMaterialSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Week 4 Public Policy Lecture Recording"
                  value={materialTitle}
                  onChange={e => setMaterialTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resource Type
                  </label>
                  <select
                    value={materialType}
                    onChange={e => setMaterialType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="document">Document (PDF/DOC)</option>
                    <option value="video">Video Recording (MP4)</option>
                    <option value="youtube">YouTube Video Link</option>
                    <option value="link">Web Resource Link</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    File Size / Tag
                  </label>
                  <input
                    type="text"
                    value={materialFileSize}
                    onChange={e => setMaterialFileSize(e.target.value)}
                    placeholder="e.g. 15.4 MB"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {materialType === 'youtube' ? 'YouTube URL *' : 'Download URL or File Path'}
                </label>
                <input
                  type="text"
                  placeholder={
                    materialType === 'youtube'
                      ? 'https://www.youtube.com/watch?v=...'
                      : 'https://cdn.lipa.edu.lr/materials/...'
                  }
                  value={materialUrl}
                  onChange={e => setMaterialUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context or instructions for candidates..."
                  value={materialDescription}
                  onChange={e => setMaterialDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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

      {/* Modal: Plan New Lecture */}
      {isAddLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Schedule Lecture Session
              </h3>
              <button
                onClick={() => setIsAddLessonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddLessonSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lesson Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Budgetary Systems and Fiscal Accountability"
                  value={lessonTitle}
                  onChange={e => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={lessonDate}
                    onChange={e => setLessonDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={lessonTime}
                    onChange={e => setLessonTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={lessonDuration}
                    onChange={e => setLessonDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hall / Virtual Link
                  </label>
                  <input
                    type="text"
                    value={lessonRoom}
                    onChange={e => setLessonRoom(e.target.value)}
                    placeholder="Academic Hall 101"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Session Learning Objectives (one per line)
                </label>
                <textarea
                  rows={3}
                  value={lessonObjectives}
                  onChange={e => setLessonObjectives(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLessonModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg font-semibold hover:bg-[#1e3a8a]/90"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Assignment */}
      {isAddAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Publish Course Assignment
              </h3>
              <button
                onClick={() => setIsAddAssignmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddAssignmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Case Study Analysis: Civil Service Modernization"
                  value={asgTitle}
                  onChange={e => setAsgTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={asgDueDate}
                    onChange={e => setAsgDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Maximum Points
                  </label>
                  <input
                    type="number"
                    value={asgPoints}
                    onChange={e => setAsgPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instructions & Guidelines
                </label>
                <textarea
                  rows={4}
                  placeholder="Specify submission guidelines, word counts, and formatting requirements..."
                  value={asgDescription}
                  onChange={e => setAsgDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAssignmentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg font-semibold hover:bg-[#1e3a8a]/90"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Submission */}
      {selectedAssignmentForSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                Submit Assignment Deliverable
              </h3>
              <button
                onClick={() => setSelectedAssignmentForSubmission(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                &times;
              </button>
            </div>

            {submissionSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-xs text-emerald-800 dark:text-emerald-200 font-semibold space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p>{submissionSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleStudentSubmissionSubmit} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {selectedAssignmentForSubmission.title}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Due: {selectedAssignmentForSubmission.dueDate} | Max Points: {selectedAssignmentForSubmission.totalPoints}
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Upload File (PDF, DOCX, ZIP)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {submissionFileName || 'Click or drag file here to attach document'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      id="asg-file-upload"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setSubmissionFileName(e.target.files[0].name);
                        }
                      }}
                    />
                    <label
                      htmlFor="asg-file-upload"
                      className="mt-2 inline-block px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs font-semibold cursor-pointer"
                    >
                      Browse Device
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Candidate Notes / Summary
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add any candidate notes or research citations for your instructor..."
                    value={submissionText}
                    onChange={e => setSubmissionText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignmentForSubmission(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1e3a8a] text-white rounded-lg font-semibold hover:bg-[#1e3a8a]/90"
                  >
                    Submit for Grading
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
