import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Printer,
  Edit3,
  Eye,
  Plus,
  Mail,
  Phone,
  MessageCircle,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  DollarSign,
  CreditCard,
  Trash2,
  FileText,
  Activity,
  User,
  Filter,
  Calendar,
  LogIn
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { UserProfile, LearnType } from '../../types';

interface AllStudentsPageProps {
  onNavigateToEnrollment?: () => void;
  onNavigateToFinances?: (studentId: string) => void;
}

export const AllStudentsPage: React.FC<AllStudentsPageProps> = ({
  onNavigateToEnrollment,
  onNavigateToFinances
}) => {
  const {
    usersDirectory,
    courses,
    transactions,
    studentProgress,
    submissions,
    updateStudentRecord,
    deleteUser,
    updateUserStatus,
    switchToSpecificUser,
    settings
  } = useLms();

  const students = usersDirectory.filter(u => u.role === 'student');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedLearnType, setSelectedLearnType] = useState('ALL');
  const [selectedBalanceFilter, setSelectedBalanceFilter] = useState<'ALL' | 'CLEARED' | 'OWED'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [viewingStudent, setViewingStudent] = useState<UserProfile | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<'info' | 'academics' | 'financial' | 'activity'>('info');
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [printingStudent, setPrintingStudent] = useState<UserProfile | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsApp, setEditWhatsApp] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [editDept, setEditDept] = useState('');
  const [editLearnType, setEditLearnType] = useState<LearnType>('Online');
  const [editStatus, setEditStatus] = useState<UserProfile['status']>('active');
  const [editCourses, setEditCourses] = useState<string[]>([]);

  const handleOpenEdit = (student: UserProfile) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditStudentId(student.studentId || '');
    setEditEmail(student.email);
    setEditPhone(student.phone || '');
    setEditWhatsApp(student.whatsApp || '');
    setEditAddress(student.address || '');
    setEditDob(student.dateOfBirth || '');
    setEditGender(student.gender || 'Male');
    setEditDept(student.department || '');
    setEditLearnType(student.learnType || 'Online');
    setEditStatus(student.status);
    setEditCourses(student.assignedCourseIds || (student.selectedCourseId ? [student.selectedCourseId] : []));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const matchedCourse = courses.find(c => editCourses.includes(c.id));

    updateStudentRecord(editingStudent.id, {
      name: editName,
      studentId: editStudentId,
      email: editEmail,
      phone: editPhone,
      whatsApp: editWhatsApp,
      address: editAddress,
      dateOfBirth: editDob,
      gender: editGender,
      department: matchedCourse ? matchedCourse.department : editDept,
      learnType: editLearnType,
      status: editStatus,
      assignedCourseIds: editCourses,
      selectedCourseId: editCourses[0] || '',
      selectedCourseName: matchedCourse ? matchedCourse.title : editingStudent.selectedCourseName
    });

    setEditingStudent(null);
  };

  const toggleCourse = (courseId: string) => {
    // Single course assignment rule
    setEditCourses([courseId]);
  };

  // Filter Logic
  const filteredStudents = students.filter(st => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.phone || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || st.department === selectedDept;
    const matchesLearn = selectedLearnType === 'ALL' || st.learnType === selectedLearnType;
    const matchesStatus = selectedStatus === 'ALL' || st.status === selectedStatus;

    const balance = st.balanceOwed !== undefined ? st.balanceOwed : Math.max(0, (st.totalDue || 0) - (st.paidAmount || 0));
    const matchesBalance =
      selectedBalanceFilter === 'ALL'
        ? true
        : selectedBalanceFilter === 'CLEARED'
        ? balance === 0
        : balance > 0;

    return matchesSearch && matchesDept && matchesLearn && matchesStatus && matchesBalance;
  });

  const departments = Array.from(
    new Set(students.map(s => s.department).filter(Boolean))
  ) as string[];

  // Print Handlers
  const handlePrintSingle = (student: UserProfile) => {
    setPrintingStudent(student);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handlePrintRoster = () => {
    window.print();
  };

  // Aggregate Stats
  const totalBilled = students.reduce((acc, s) => acc + (s.totalDue || 0), 0);
  const totalCollected = students.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);
  const clearedStudentsCount = students.filter(s => {
    const bal = s.balanceOwed !== undefined ? s.balanceOwed : (s.totalDue || 0) - (s.paidAmount || 0);
    return bal <= 0;
  }).length;

  return (
    <div id="all-students-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-red-600 dark:text-red-400 uppercase">
            <GraduationCap className="w-4 h-4 text-red-600" />
            <span>Institutional Admissions & Registrar</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mt-1">
            All Registered Students
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Centralized student database with course enrollments, attendance status, financial balances, and printable official records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <button
            id="btn-print-student-roster"
            type="button"
            onClick={handlePrintRoster}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Student Directory</span>
          </button>
          {onNavigateToEnrollment && (
            <button
              id="btn-register-new-student-nav"
              type="button"
              onClick={onNavigateToEnrollment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Registered Students</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {students.length}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Total institutional cohort</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Bursar Cleared</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {clearedStudentsCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Zero balance accounts</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Assessed Tuition</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono">
            ${totalBilled.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Exact course fees billed</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Outstanding Balance</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1 font-mono">
            ${totalOutstanding.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Collectable receivables</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-student-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search students by name, student ID, email, or department..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Department Filter */}
            <select
              id="filter-student-dept"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Learn Type Filter */}
            <select
              id="filter-student-learntype"
              value={selectedLearnType}
              onChange={e => setSelectedLearnType(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Learn Types</option>
              <option value="Online">Online</option>
              <option value="On Site">On Site</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            {/* Financial Balance Filter */}
            <select
              id="filter-student-balance"
              value={selectedBalanceFilter}
              onChange={e => setSelectedBalanceFilter(e.target.value as 'ALL' | 'CLEARED' | 'OWED')}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Financial Statuses</option>
              <option value="CLEARED">Fully Cleared (Paid)</option>
              <option value="OWED">Has Outstanding Balance</option>
            </select>

            {/* Status Filter */}
            <select
              id="filter-student-status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Enrolled Statuses</option>
              <option value="active">Active</option>
              <option value="leave">On Leave</option>
              <option value="suspended">Suspended</option>
            </select>

            {(searchQuery || selectedDept !== 'ALL' || selectedLearnType !== 'ALL' || selectedBalanceFilter !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('ALL');
                  setSelectedLearnType('ALL');
                  setSelectedBalanceFilter('ALL');
                  setSelectedStatus('ALL');
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:underline px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Student Database Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Student Records ({filteredStudents.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Admissions and Bursar balance tracking
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Student Records Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || selectedDept !== 'ALL'
                ? 'No students matched your search criteria or filters.'
                : 'No students have been enrolled yet. Use Registration & Enrollment to admit your first student.'}
            </p>
            {onNavigateToEnrollment && (
              <button
                type="button"
                onClick={onNavigateToEnrollment}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll First Student</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Student Profile</th>
                  <th className="py-3 px-4">Department & Mode</th>
                  <th className="py-3 px-4">Enrolled Courses</th>
                  <th className="py-3 px-4">Total Due</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Balance Owed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right print:hidden">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                {filteredStudents.map(student => {
                  const assignedCourseList = courses.filter(c =>
                    student.assignedCourseIds?.includes(c.id)
                  );
                  const totalDue = student.totalDue || 0;
                  const paidAmount = student.paidAmount || 0;
                  const balanceOwed =
                    student.balanceOwed !== undefined
                      ? student.balanceOwed
                      : Math.max(0, totalDue - paidAmount);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/75 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                              {student.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {student.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <span className="font-mono text-red-600 dark:text-red-400 font-medium">
                                {student.studentId || 'STU-NEW'}
                              </span>
                              <span>•</span>
                              <span>{student.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department & Mode */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                            {student.department || 'General Studies'}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {student.learnType || 'Online'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Enrolled Courses */}
                      <td className="py-3.5 px-4">
                        {assignedCourseList.length === 0 ? (
                          <span className="text-slate-400 text-[11px] italic">
                            No courses enrolled
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {assignedCourseList.map(c => (
                              <span
                                key={c.id}
                                title={`${c.title} - $${(c.tuitionFee || 0).toLocaleString()}`}
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900"
                              >
                                {c.code}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Total Due */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        ${totalDue.toLocaleString()}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${paidAmount.toLocaleString()}
                      </td>

                      {/* Balance Owed */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span
                            className={`font-mono font-bold text-xs ${
                              balanceOwed > 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            ${balanceOwed.toLocaleString()}
                          </span>
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                balanceOwed <= 0
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                              }`}
                            >
                              {balanceOwed <= 0 ? 'CLEARED' : 'DUE'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={student.status}
                          onChange={e => updateUserStatus(student.id, e.target.value as UserProfile['status'])}
                          className={`px-2 py-1 rounded text-xs font-semibold border focus:outline-none ${
                            student.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="leave">On Leave</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>

                      {/* Administrative Actions */}
                      <td className="py-3.5 px-4 text-right print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-impersonate-student-${student.id}`}
                            type="button"
                            onClick={() => switchToSpecificUser(student)}
                            title="Log in to Student Portal as this student"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-md transition cursor-pointer"
                          >
                            <LogIn className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-view-student-${student.id}`}
                            type="button"
                            onClick={() => {
                              setViewingStudent(student);
                              setActiveDossierTab('info');
                            }}
                            title="View Complete Student Dossier & Activity"
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-edit-student-${student.id}`}
                            type="button"
                            onClick={() => handleOpenEdit(student)}
                            title="Edit Student Information"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-print-student-${student.id}`}
                            type="button"
                            onClick={() => handlePrintSingle(student)}
                            title="Export & Print Official Student Record"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {onNavigateToFinances && (
                            <button
                              id={`btn-bursar-student-${student.id}`}
                              type="button"
                              onClick={() => onNavigateToFinances(student.id)}
                              title="Record Payment in Financial Record"
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-md transition cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            id={`btn-delete-student-${student.id}`}
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove ${student.name} from the student database?`)) {
                                deleteUser(student.id);
                              }
                            }}
                            title="Remove Student Record"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal 1: Complete Student Dossier with Activity & Financial Records */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="font-bold text-base font-serif">
                    Official Student Academic & Bursar Dossier
                  </h3>
                  <p className="text-xs text-slate-300">
                    LIPA eLearning Center Academic Registry • ID: {viewingStudent.studentId || 'STU-NEW'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const st = viewingStudent;
                    setViewingStudent(null);
                    switchToSpecificUser(st);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition cursor-pointer"
                  title="Test and operate Student Portal as this user"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Access Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const st = viewingStudent;
                    setViewingStudent(null);
                    handlePrintSingle(st);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Export for Printing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingStudent(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Overview Strip */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {viewingStudent.avatar ? (
                <img
                  src={viewingStudent.avatar}
                  alt={viewingStudent.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-red-500 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xl shrink-0">
                  {viewingStudent.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {viewingStudent.name}
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold self-center sm:self-auto ${
                      (viewingStudent.balanceOwed || 0) <= 0
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {(viewingStudent.balanceOwed || 0) <= 0 ? 'BURSAR CLEARED' : 'BALANCE OUTSTANDING'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  ID: {viewingStudent.studentId || 'STU-NEW'} • {viewingStudent.email} • {viewingStudent.department}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 bg-white dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveDossierTab('info')}
                className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  activeDossierTab === 'info'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Personal & Registration</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab('academics')}
                className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  activeDossierTab === 'academics'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Enrolled Courses & Standing</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab('financial')}
                className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  activeDossierTab === 'financial'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Financial & Bursar Ledger</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDossierTab('activity')}
                className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  activeDossierTab === 'activity'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Activity & Submissions</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 text-xs max-h-[420px] overflow-y-auto">
              {/* Tab 1: Personal & Registration */}
              {activeDossierTab === 'info' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 font-medium">Full Legal Name</span>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {viewingStudent.name}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 font-medium">Official Student ID</span>
                    <p className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
                      {viewingStudent.studentId || 'STU-NEW'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 font-medium">Email Address</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {viewingStudent.email}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 font-medium">Phone & WhatsApp</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {viewingStudent.phone || 'No phone'}
                      {viewingStudent.whatsApp && ` • WA: ${viewingStudent.whatsApp}`}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 font-medium">Department & Major</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {viewingStudent.department} • {viewingStudent.major || 'Administration'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 font-medium">Learning Delivery Mode</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {viewingStudent.learnType || 'Online'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 font-medium">Date of Birth & Gender</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {viewingStudent.dateOfBirth || 'Not specified'} • {viewingStudent.gender || 'Not specified'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 font-medium">Study Mode</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {viewingStudent.learnType || 'Online'}
                    </p>
                  </div>

                  <div className="sm:col-span-2 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 font-medium">Residential / Contact Address</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {viewingStudent.address || 'Monrovia, Liberia'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Enrolled Courses & Standing */}
              {activeDossierTab === 'academics' && (
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Registered Courses ({viewingStudent.assignedCourseIds?.length || 0})</span>
                    <span className="text-slate-500 font-normal">
                      Academic Term: {viewingStudent.joinedDate || settings.currentTerm}
                    </span>
                  </h5>

                  {courses.filter(c => viewingStudent.assignedCourseIds?.includes(c.id)).length === 0 ? (
                    <p className="text-slate-400 italic p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      No academic courses enrolled for this student.
                    </p>
                  ) : (
                    courses
                      .filter(c => viewingStudent.assignedCourseIds?.includes(c.id))
                      .map(c => {
                        const prog = studentProgress.find(p => p.courseId === c.id);
                        return (
                          <div
                            key={c.id}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-red-600 dark:text-red-400">
                                  {c.code}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {c.title}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {c.credits} Credits • Fixed Tuition: ${(c.tuitionFee || 0).toLocaleString()} • Instructor: {c.instructorName}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                Grade: {prog?.currentGrade || 'In Progress'}
                              </span>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Score: {prog?.currentScore !== undefined ? `${prog.currentScore}%` : 'Pending'}
                              </p>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              )}

              {/* Tab 3: Financial & Bursar Ledger */}
              {activeDossierTab === 'financial' && (
                <div className="space-y-4">
                  {/* Financial Balance Summary */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                    <div>
                      <span className="text-slate-500 font-medium">Total Assessed</span>
                      <p className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                        ${(viewingStudent.totalDue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Total Paid</span>
                      <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ${(viewingStudent.paidAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Balance Owed</span>
                      <p
                        className={`text-lg font-bold font-mono mt-0.5 ${
                          (viewingStudent.balanceOwed || 0) > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        ${(viewingStudent.balanceOwed || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Payment Transactions */}
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                      <span>Official Bursar Transactions</span>
                      {onNavigateToFinances && (
                        <button
                          type="button"
                          onClick={() => {
                            const stId = viewingStudent.id;
                            setViewingStudent(null);
                            onNavigateToFinances(stId);
                          }}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          + Record Payment in Financial Record
                        </button>
                      )}
                    </h5>

                    {transactions.filter(
                      t => t.studentId === viewingStudent.id || t.studentId === viewingStudent.studentId
                    ).length === 0 ? (
                      <p className="text-slate-400 italic p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        No official payment transactions recorded for this student yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {transactions
                          .filter(
                            t => t.studentId === viewingStudent.id || t.studentId === viewingStudent.studentId
                          )
                          .map(tx => (
                            <div
                              key={tx.id}
                              className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-red-600 dark:text-red-400">
                                    {tx.receiptNumber}
                                  </span>
                                  <span className="font-semibold text-slate-900 dark:text-white">
                                    {tx.category} Payment
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {tx.date} • {tx.method} • Ref: {tx.referenceCode}
                                </p>
                              </div>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                +${(tx.amount || 0).toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Activity & Submissions */}
              {activeDossierTab === 'activity' && (
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-900 dark:text-white">
                    Classroom Activity & Assignments
                  </h5>
                  {submissions.filter(
                    s => s.studentId === viewingStudent.id || s.studentId === viewingStudent.studentId
                  ).length === 0 ? (
                    <p className="text-slate-400 italic p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      No assignment submissions or coursework activity logged for this student.
                    </p>
                  ) : (
                    submissions
                      .filter(
                        s => s.studentId === viewingStudent.id || s.studentId === viewingStudent.studentId
                      )
                      .map(sub => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {sub.assignmentTitle}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Submitted: {sub.submittedAt} • Status: {sub.status}
                            </p>
                          </div>
                          <div className="text-right font-mono font-bold">
                            {sub.score !== undefined ? (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {sub.score} / {sub.maxScore}
                              </span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400">
                                Ungraded
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const st = viewingStudent;
                  setViewingStudent(null);
                  handlePrintSingle(st);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Export / Print Student Record</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const st = viewingStudent;
                    setViewingStudent(null);
                    handleOpenEdit(st);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition cursor-pointer"
                >
                  Edit Registration Details
                </button>
                <button
                  type="button"
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Student Details */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="font-bold text-base font-serif">
                    Edit Student Record: {editingStudent.name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Student ID: {editingStudent.studentId || 'STU-NEW'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentId}
                    onChange={e => setEditStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="+231 77 000 0000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={editWhatsApp}
                    onChange={e => setEditWhatsApp(e.target.value)}
                    placeholder="+231 77 000 0000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Learning Delivery Mode
                  </label>
                  <select
                    value={editLearnType}
                    onChange={e => setEditLearnType(e.target.value as LearnType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Online">Online</option>
                    <option value="On Site">On Site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as UserProfile['status'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="active">Active (Enrolled)</option>
                    <option value="leave">On Leave</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={e => setEditDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={editGender}
                    onChange={e => setEditGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    placeholder="Residential address in Monrovia"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Course Enrollment (Strictly Single Course - Recalculates exact tuition) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assigned Academic Course (Single Course Enrollment)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Selecting a course automatically sets the student's department, fixed course tuition amount, and re-balances what they owe.
                </p>
                <div className="max-h-48 overflow-y-auto p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-1.5">
                  {courses.length === 0 ? (
                    <p className="text-slate-400 italic">No courses established in catalog yet.</p>
                  ) : (
                    courses.map(c => {
                      const isSelected = editCourses.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                            isSelected
                              ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="assignedCourseSingle"
                              checked={isSelected}
                              onChange={() => toggleCourse(c.id)}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <div>
                              <span className="font-mono font-bold text-red-600 dark:text-red-400 mr-2">
                                {c.code}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {c.title}
                              </span>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Dept: {c.department} • {c.credits} Credits
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs shrink-0">
                            ${(c.tuitionFee || 0).toLocaleString()}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition shadow-sm cursor-pointer"
                >
                  Save Changes & Recalculate Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print View for Single Student Official Record */}
      {printingStudent && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 text-black z-50">
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
            <h1 className="text-xl font-bold font-serif uppercase tracking-wider">
              Liberia Institute of Public Administration (LIPA)
            </h1>
            <h2 className="text-sm font-semibold text-slate-700 mt-0.5">
              Office of Academic Affairs & Bursar • Official Student Academic Record
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Date Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="space-y-5 text-xs">
            {/* Student Info Box */}
            <div className="p-4 border border-slate-300 rounded-lg">
              <h3 className="font-bold text-sm uppercase text-slate-800 mb-2.5">
                Student Identification & Registration
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div><strong>Full Legal Name:</strong> {printingStudent.name}</div>
                <div><strong>Student ID Number:</strong> {printingStudent.studentId || 'STU-NEW'}</div>
                <div><strong>Email Address:</strong> {printingStudent.email}</div>
                <div><strong>Phone Number:</strong> {printingStudent.phone || 'N/A'}</div>
                <div><strong>Academic Department:</strong> {printingStudent.department}</div>
                <div><strong>Learning Delivery Mode:</strong> {printingStudent.learnType || 'Online'}</div>
                <div><strong>Joined Term:</strong> {printingStudent.joinedDate || 'Fall 2026'}</div>
                <div><strong>Account Standing:</strong> {printingStudent.status.toUpperCase()}</div>
              </div>
            </div>

            {/* Course Enrollment Ledger */}
            <div className="p-4 border border-slate-300 rounded-lg">
              <h3 className="font-bold text-sm uppercase text-slate-800 mb-2.5">
                Enrolled Academic Curricula
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-bold">
                    <th className="p-2">Course Code</th>
                    <th className="p-2">Course Title</th>
                    <th className="p-2">Instructor</th>
                    <th className="p-2">Credits</th>
                    <th className="p-2 text-right">Fixed Tuition Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {courses
                    .filter(c => printingStudent.assignedCourseIds?.includes(c.id))
                    .map(c => (
                      <tr key={c.id} className="border-b border-slate-100">
                        <td className="p-2 font-mono font-bold">{c.code}</td>
                        <td className="p-2">{c.title}</td>
                        <td className="p-2">{c.instructorName}</td>
                        <td className="p-2">{c.credits} Credits</td>
                        <td className="p-2 text-right font-mono font-bold">
                          ${(c.tuitionFee || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Bursar Balance Reconciliation */}
            <div className="p-4 border border-slate-300 rounded-lg">
              <h3 className="font-bold text-sm uppercase text-slate-800 mb-2">
                Official Bursar Account Reconciliation
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center border-t border-b border-slate-200 py-3 my-2">
                <div>
                  <span className="text-slate-500 font-medium">Total Assessed:</span>
                  <p className="text-base font-bold font-mono">
                    ${(printingStudent.totalDue || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Total Paid to Date:</span>
                  <p className="text-base font-bold font-mono text-emerald-700">
                    ${(printingStudent.paidAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Current Balance Owed:</span>
                  <p className="text-base font-bold font-mono text-red-700">
                    ${(printingStudent.balanceOwed || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic mt-2">
                Certification: This document serves as an authentic institutional transcript of registration and bursar standing for {printingStudent.name}.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-slate-500 pt-2">
                <p className="font-bold">Registrar & Admissions Officer</p>
                <p className="text-[11px] text-slate-500">Official Institutional Signature</p>
              </div>
              <div className="border-t border-slate-500 pt-2">
                <p className="font-bold">Bursar & Financial Comptroller</p>
                <p className="text-[11px] text-slate-500">Official Institutional Seal</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
