import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Download,
  CheckCircle2,
  Calendar,
  MapPin,
  Globe,
  BookOpen,
  Send,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { UserProfile, Course } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface InstructorClassRostersProps {
  preselectedCourseId?: string;
  onSelectClass?: (courseId: string) => void;
}

export const InstructorClassRosters: React.FC<InstructorClassRostersProps> = ({
  preselectedCourseId,
  onSelectClass
}) => {
  const {
    currentUser,
    courses,
    usersDirectory,
    attendanceRoster,
    studentProgress,
    sendEmailNotification
  } = useLms();

  // Instructor's courses
  const instructorCourses = courses.filter(
    c =>
      c.instructorId === currentUser.id ||
      c.instructorName === currentUser.name ||
      (currentUser.assignedCourseIds && currentUser.assignedCourseIds.includes(c.id))
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    preselectedCourseId || instructorCourses[0]?.id || ''
  );

  // Sync if preselectedCourseId changes
  React.useEffect(() => {
    if (preselectedCourseId) {
      setSelectedCourseId(preselectedCourseId);
    }
  }, [preselectedCourseId]);

  const activeCourse =
    instructorCourses.find(c => c.id === selectedCourseId) || instructorCourses[0];

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'Online' | 'On-site' | 'scholarship'>('all');

  // Contact Student Modal
  const [contactStudent, setContactStudent] = useState<UserProfile | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  // Detail Student Modal
  const [inspectedStudent, setInspectedStudent] = useState<UserProfile | null>(null);

  // Get students enrolled in activeCourse
  const enrolledStudents = usersDirectory.filter(
    u =>
      u.role === 'student' &&
      activeCourse &&
      ((u.assignedCourseIds && u.assignedCourseIds.includes(activeCourse.id)) ||
        u.selectedCourseId === activeCourse.id)
  );

  const filteredStudents = enrolledStudents.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.phone && student.phone.includes(searchQuery));

    const matchesMode =
      modeFilter === 'all' ||
      (modeFilter === 'Online' && student.learnType === 'Online') ||
      (modeFilter === 'On-site' && (student.learnType === 'On-site' || !student.learnType)) ||
      (modeFilter === 'scholarship' && student.isScholarship);

    return matchesSearch && matchesMode;
  });

  // Calculate statistics for active class
  const onlineCount = enrolledStudents.filter(s => s.learnType === 'Online').length;
  const onsiteCount = enrolledStudents.filter(s => s.learnType === 'On-site' || !s.learnType).length;
  const scholarshipCount = enrolledStudents.filter(s => s.isScholarship).length;

  // Handle Send Student Email / Academic Note
  const handleSendStudentEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactStudent || !emailSubject.trim() || !emailMessage.trim()) return;

    sendEmailNotification({
      recipientEmail: contactStudent.email,
      recipientName: contactStudent.name,
      subject: `[${activeCourse?.code || 'Course'}] ${emailSubject}`,
      type: 'project_assigned',
      content: `Dear ${contactStudent.name},\n\nYour instructor ${currentUser.name} has sent you an academic note regarding ${activeCourse?.code} - ${activeCourse?.title}:\n\n${emailMessage}\n\nBest regards,\nFaculty of ${currentUser.department || 'LIPA'}`,
      actionUrl: '#courses',
      actionText: 'Open Coursework Console',
      studentId: contactStudent.id
    });

    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setContactStudent(null);
      setEmailSubject('');
      setEmailMessage('');
    }, 1500);
  };

  // Export Roster as CSV
  const handleExportCSV = () => {
    if (!activeCourse || enrolledStudents.length === 0) return;

    const headers = ['Student ID', 'Full Name', 'Email', 'Phone', 'Mode', 'Scholarship', 'Status'];
    const rows = enrolledStudents.map(s => [
      s.studentId || s.id,
      `"${s.name}"`,
      s.email,
      s.phone || 'N/A',
      s.learnType || 'On-site',
      s.isScholarship ? 'Yes (Scholarship)' : 'Standard',
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeCourse.code}_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="instructor-class-rosters-view">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Users className="w-3.5 h-3.5" />
              <span>Cohort Enrollment &amp; Student Lists</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Class Rosters &amp; Student Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              View individual student rosters organized by class. Check student attendance, learning modes (Online or On-site), scholarship statuses, and dispatch academic notes directly to students.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={enrolledStudents.length === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold border border-slate-700 transition-all flex items-center shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Export Roster (.CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Class To Inspect Roster:
          </span>
          <span className="text-xs font-medium text-slate-400">
            {instructorCourses.length} Assigned Classes
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {instructorCourses.map(crs => {
            const isSelected = activeCourse?.id === crs.id;
            const count = usersDirectory.filter(
              u =>
                u.role === 'student' &&
                ((u.assignedCourseIds && u.assignedCourseIds.includes(crs.id)) ||
                  u.selectedCourseId === crs.id)
            ).length;

            return (
              <button
                key={crs.id}
                id={`select-class-roster-btn-${crs.id}`}
                onClick={() => {
                  setSelectedCourseId(crs.id);
                  if (onSelectClass) onSelectClass(crs.id);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1e3a8a] text-white shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span className="font-mono font-bold">{crs.code}</span>
                <span className="max-w-[140px] truncate hidden sm:inline">{crs.title}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Class Banner Details */}
      {activeCourse && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 border border-blue-200/60">
                {activeCourse.code}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  activeCourse.location === 'Online'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {activeCourse.location || 'On-site'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeCourse.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                Classroom: {activeCourse.classroom || activeCourse.room || 'Hall 101'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                {activeCourse.schedule || 'Scheduled Session'}
              </span>
            </div>
          </div>

          {/* Quick Stats for this Class */}
          <div className="flex items-center gap-3 sm:gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Enrolled</span>
              <span className="text-xl font-mono font-bold text-slate-900 dark:text-white">
                {enrolledStudents.length} / {activeCourse.capacity}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">On-site / Online</span>
              <span className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">
                {onsiteCount} / {onlineCount}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Scholarships</span>
              <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {scholarshipCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter students by name, ID, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setModeFilter('all')}
              className={`px-3 py-1 font-medium rounded-lg transition-all ${
                modeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({enrolledStudents.length})
            </button>
            <button
              onClick={() => setModeFilter('On-site')}
              className={`px-3 py-1 font-medium rounded-lg transition-all ${
                modeFilter === 'On-site'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              On-site ({onsiteCount})
            </button>
            <button
              onClick={() => setModeFilter('Online')}
              className={`px-3 py-1 font-medium rounded-lg transition-all ${
                modeFilter === 'Online'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Online ({onlineCount})
            </button>
            <button
              onClick={() => setModeFilter('scholarship')}
              className={`px-3 py-1 font-medium rounded-lg transition-all ${
                modeFilter === 'scholarship'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Scholarship ({scholarshipCount})
            </button>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {enrolledStudents.length === 0 ? 'No Students Enrolled in this Class Yet' : 'No Students Match Filter'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {enrolledStudents.length === 0
                ? `Students registered or assigned to ${activeCourse?.code || 'this course'} by Academic Administration will populate this roster automatically.`
                : 'Try adjusting your search keywords or switching filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student Profile</th>
                  <th className="py-3 px-3">Contact Details</th>
                  <th className="py-3 px-3 text-center">Learning Mode</th>
                  <th className="py-3 px-3 text-center">Scholarship</th>
                  <th className="py-3 px-3 text-center">Attendance</th>
                  <th className="py-3 px-3 text-center">Academic Grade</th>
                  <th className="py-3 px-4 text-right">Direct Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredStudents.map(student => {
                  const studentAttendance = attendanceRoster.find(
                    att =>
                      (att.studentId === student.id || att.studentId === student.studentId) &&
                      activeCourse &&
                      att.courseId === activeCourse.id
                  );
                  const progress = studentProgress.find(
                    sp =>
                      activeCourse &&
                      sp.courseId === activeCourse.id
                  );
                  const attendancePct = studentAttendance?.attendancePercent || 95;
                  const currentGrade = progress?.currentGrade || 'A';
                  const currentScore = progress?.currentScore || 94;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Student Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <UserAvatar
                            avatar={student.avatar}
                            name={student.name}
                            size="md"
                            className="ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              {student.name}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">
                              ID: {student.studentId || student.id}
                            </div>
                            {student.gender && (
                              <span className="text-[10px] text-slate-400 capitalize">
                                {student.gender}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{student.email}</span>
                          </div>
                          {student.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Learning Mode */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            student.learnType === 'Online'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {student.learnType === 'Online' ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <MapPin className="w-3 h-3" />
                          )}
                          {student.learnType || 'On-site'}
                        </span>
                      </td>

                      {/* Scholarship Status */}
                      <td className="py-3.5 px-3 text-center">
                        {student.isScholarship ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            <Award className="w-3 h-3" />
                            {student.scholarshipType || 'Scholarship'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Standard</span>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-block text-center">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {attendancePct}%
                          </span>
                          <div className="w-16 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1 mx-auto">
                            <div
                              className={`h-full rounded-full ${
                                attendancePct >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${attendancePct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Academic Grade */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono font-extrabold text-sm text-[#1e3a8a] dark:text-blue-400">
                          {currentGrade}
                        </span>
                        <span className="text-[10px] text-slate-400 block">({currentScore}%)</span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setContactStudent(student);
                              setEmailSubject(`Academic Update: ${activeCourse?.code}`);
                              setEmailMessage(`Dear ${student.name},\n\nPlease be reminded to submit your pending coursework and review the latest lecture materials.`);
                            }}
                            title="Send Note / Email"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Send Note</span>
                          </button>

                          <button
                            onClick={() => setInspectedStudent(student)}
                            title="View Student Dossier"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Send Note / Email to Student */}
      {contactStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Send Academic Note to Student
                </h3>
              </div>
              <button
                onClick={() => setContactStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {sendSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Message Dispatched Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  Notification has been sent to {contactStudent.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendStudentEmail} className="space-y-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center space-x-3">
                  <UserAvatar avatar={contactStudent.avatar} name={contactStudent.name} size="md" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{contactStudent.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {contactStudent.email} • ID: {contactStudent.studentId || contactStudent.id}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Message Body &amp; Feedback *
                  </label>
                  <textarea
                    rows={4}
                    value={emailMessage}
                    onChange={e => setEmailMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setContactStudent(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Note
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Student Dossier Details */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Student Academic Dossier
              </h3>
              <button
                onClick={() => setInspectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="text-center space-y-2 py-2">
              <UserAvatar
                avatar={inspectedStudent.avatar}
                name={inspectedStudent.name}
                size="xl"
                className="mx-auto ring-2 ring-blue-500/30"
              />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {inspectedStudent.name}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Student ID: {inspectedStudent.studentId || inspectedStudent.id}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2.5 text-xs border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Institutional Email:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectedStudent.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone Number:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{inspectedStudent.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Learning Mode:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{inspectedStudent.learnType || 'On-site'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Cohort:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{activeCourse?.code || 'Course'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Enrollment Status:</span>
                <span className="font-bold text-emerald-600 capitalize">{inspectedStudent.status}</span>
              </div>
              {inspectedStudent.isScholarship && (
                <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Scholarship:</span>
                  <span className="font-bold text-emerald-600">{inspectedStudent.scholarshipType || 'Institutional'}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedStudent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
