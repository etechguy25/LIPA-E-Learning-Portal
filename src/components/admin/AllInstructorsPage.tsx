import React, { useState } from 'react';
import {
  Users,
  Search,
  Printer,
  Edit3,
  Eye,
  Plus,
  Mail,
  Phone,
  MessageCircle,
  Building,
  GraduationCap,
  Calendar,
  CheckCircle2,
  X,
  UserCheck,
  BookOpen,
  Award,
  ShieldCheck,
  Filter,
  Trash2,
  LogIn
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { UserProfile, EducationLevel, ContractLength } from '../../types';

interface AllInstructorsPageProps {
  onNavigateToEnrollment?: () => void;
}

export const AllInstructorsPage: React.FC<AllInstructorsPageProps> = ({ onNavigateToEnrollment }) => {
  const {
    usersDirectory,
    courses,
    updateInstructorRecord,
    deleteUser,
    updateUserStatus,
    switchToSpecificUser
  } = useLms();

  const instructors = usersDirectory.filter(u => u.role === 'instructor');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedEducation, setSelectedEducation] = useState('ALL');

  // Modals state
  const [viewingInstructor, setViewingInstructor] = useState<UserProfile | null>(null);
  const [editingInstructor, setEditingInstructor] = useState<UserProfile | null>(null);
  const [printingInstructor, setPrintingInstructor] = useState<UserProfile | null>(null);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsApp, setEditWhatsApp] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editEducation, setEditEducation] = useState<EducationLevel>('Master');
  const [editContract, setEditContract] = useState<ContractLength>('2 Years');
  const [editStatus, setEditStatus] = useState<UserProfile['status']>('active');
  const [editCourses, setEditCourses] = useState<string[]>([]);

  const handleOpenEdit = (inst: UserProfile) => {
    setEditingInstructor(inst);
    setEditName(inst.name);
    setEditTitle(inst.title || 'Faculty Instructor');
    setEditEmail(inst.email);
    setEditPhone(inst.phone || '');
    setEditWhatsApp(inst.whatsApp || '');
    setEditDept(inst.department || '');
    setEditEducation((inst.educationLevel as EducationLevel) || 'Master');
    setEditContract((inst.contractLength as ContractLength) || '2 Years');
    setEditStatus(inst.status);
    setEditCourses(inst.assignedCourseIds || []);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;

    updateInstructorRecord(editingInstructor.id, {
      name: editName,
      title: editTitle,
      email: editEmail,
      phone: editPhone,
      whatsApp: editWhatsApp,
      department: editDept,
      educationLevel: editEducation,
      contractLength: editContract,
      status: editStatus,
      assignedCourseIds: editCourses
    });

    setEditingInstructor(null);
  };

  const toggleCourseAssignment = (courseId: string) => {
    setEditCourses(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  // Filter Logic
  const filteredInstructors = instructors.filter(inst => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inst.facultyId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inst.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inst.title || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || inst.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || inst.status === selectedStatus;
    const matchesEdu = selectedEducation === 'ALL' || inst.educationLevel === selectedEducation;

    return matchesSearch && matchesDept && matchesStatus && matchesEdu;
  });

  const departments = Array.from(
    new Set(instructors.map(i => i.department).filter(Boolean))
  ) as string[];

  // Print Handlers
  const handlePrintSingle = (inst: UserProfile) => {
    setPrintingInstructor(inst);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handlePrintRoster = () => {
    window.print();
  };

  const totalAssignedCurricula = instructors.reduce(
    (acc, i) => acc + (i.assignedCourseIds?.length || 0),
    0
  );
  const activeInstructorsCount = instructors.filter(i => i.status === 'active').length;
  const phdCount = instructors.filter(i => i.educationLevel === 'PHD').length;

  return (
    <div id="all-instructors-page" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-red-600 dark:text-red-400 uppercase">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Academic Faculty Registry</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mt-1">
            All Instructors & Faculty Dossiers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional directory of appointed instructors, active course assignments, and credential records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <button
            id="btn-print-instructors-roster"
            type="button"
            onClick={handlePrintRoster}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Print Faculty Directory</span>
          </button>
          {onNavigateToEnrollment && (
            <button
              id="btn-appoint-new-faculty"
              type="button"
              onClick={onNavigateToEnrollment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Appoint New Instructor</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Instructors</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {instructors.length}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Institutional appointments</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Active Faculty</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {activeInstructorsCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">In active teaching service</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Assigned Curricula</span>
            <BookOpen className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {totalAssignedCurricula}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Total course loads</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Doctoral Faculty</span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {phdCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">PhD holders</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-instructor-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search instructors by name, faculty ID, email, title, or department..."
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
              id="filter-instructor-dept"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Education Level Filter */}
            <select
              id="filter-instructor-education"
              value={selectedEducation}
              onChange={e => setSelectedEducation(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Qualifications</option>
              <option value="PHD">Doctorate (PhD)</option>
              <option value="Master">Master's Degree</option>
              <option value="Bachelor">Bachelor's Degree</option>
            </select>

            {/* Status Filter */}
            <select
              id="filter-instructor-status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="leave">On Leave</option>
              <option value="suspended">Suspended</option>
            </select>

            {(searchQuery || selectedDept !== 'ALL' || selectedStatus !== 'ALL' || selectedEducation !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('ALL');
                  setSelectedStatus('ALL');
                  setSelectedEducation('ALL');
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:underline px-2 py-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instructors Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Faculty Records ({filteredInstructors.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Official institutional teaching records
          </span>
        </div>

        {filteredInstructors.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Faculty Instructors Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || selectedDept !== 'ALL'
                ? 'No instructors matched your active search query or filter criteria.'
                : 'No faculty instructors have been appointed yet. Register an instructor to assign courses and manage curricula.'}
            </p>
            {onNavigateToEnrollment && (
              <button
                type="button"
                onClick={onNavigateToEnrollment}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Appoint First Instructor</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Department & Qualification</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Assigned Courses</th>
                  <th className="py-3 px-4">Contract</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right print:hidden">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                {filteredInstructors.map(inst => {
                  const assignedCourseList = courses.filter(c =>
                    inst.assignedCourseIds?.includes(c.id)
                  );

                  return (
                    <tr
                      key={inst.id}
                      className="hover:bg-slate-50/75 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Faculty Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {inst.avatar ? (
                            <img
                              src={inst.avatar}
                              alt={inst.name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                              {inst.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {inst.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <span className="font-mono text-red-600 dark:text-red-400 font-medium">
                                {inst.facultyId || 'FAC-NEW'}
                              </span>
                              <span>•</span>
                              <span>{inst.title || 'Faculty Member'}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department & Qualification */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{inst.department || 'Institute Faculty Council'}</span>
                          </p>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {inst.educationLevel === 'PHD'
                              ? 'Doctorate (PhD)'
                              : inst.educationLevel === 'Master'
                              ? "Master's Degree"
                              : "Bachelor's Degree"}
                          </span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <a
                            href={`mailto:${inst.email}`}
                            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-red-600 transition"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{inst.email}</span>
                          </a>
                          {inst.phone && (
                            <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{inst.phone}</span>
                            </p>
                          )}
                          {inst.whatsApp && (
                            <a
                              href={`https://wa.me/${inst.whatsApp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              <MessageCircle className="w-3 h-3 shrink-0" />
                              <span>WhatsApp Chat</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Assigned Courses */}
                      <td className="py-3.5 px-4">
                        {assignedCourseList.length === 0 ? (
                          <span className="text-slate-400 text-[11px] italic">
                            No courses assigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {assignedCourseList.map(c => (
                              <span
                                key={c.id}
                                title={`${c.title} (${c.credits} Credits - $${(c.tuitionFee || 0).toLocaleString()})`}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900"
                              >
                                {c.code}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Contract */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{inst.contractLength || '2 Years'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={inst.status}
                          onChange={e => updateUserStatus(inst.id, e.target.value as UserProfile['status'])}
                          className={`px-2 py-1 rounded text-xs font-semibold border focus:outline-none ${
                            inst.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="leave">On Leave</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-impersonate-instructor-${inst.id}`}
                            type="button"
                            onClick={() => switchToSpecificUser(inst)}
                            title="Log in to Instructor Portal as this instructor"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-md transition cursor-pointer"
                          >
                            <LogIn className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-view-instructor-${inst.id}`}
                            type="button"
                            onClick={() => setViewingInstructor(inst)}
                            title="View Faculty Dossier"
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-edit-instructor-${inst.id}`}
                            type="button"
                            onClick={() => handleOpenEdit(inst)}
                            title="Edit Instructor Details"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-print-instructor-${inst.id}`}
                            type="button"
                            onClick={() => handlePrintSingle(inst)}
                            title="Print Official Faculty Dossier"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-instructor-${inst.id}`}
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove ${inst.name} from the faculty directory?`)) {
                                deleteUser(inst.id);
                              }
                            }}
                            title="Remove Faculty Member"
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

      {/* Modal 1: View Instructor Dossier */}
      {viewingInstructor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="font-bold text-base font-serif">
                    Official Faculty Dossier
                  </h3>
                  <p className="text-xs text-slate-300">
                    LIPA eLearning Center Academic Registry
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const inst = viewingInstructor;
                    setViewingInstructor(null);
                    switchToSpecificUser(inst);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition cursor-pointer"
                  title="Test and operate Instructor Portal as this faculty member"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Access Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingInstructor(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                {viewingInstructor.avatar ? (
                  <img
                    src={viewingInstructor.avatar}
                    alt={viewingInstructor.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-red-500 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xl shrink-0">
                    {viewingInstructor.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {viewingInstructor.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 self-center sm:self-auto">
                      {viewingInstructor.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {viewingInstructor.title || 'Faculty Instructor'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Faculty ID: {viewingInstructor.facultyId || 'FAC-NEW'}
                  </p>
                </div>
              </div>

              {/* Grid of Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                  <span className="text-slate-400 font-medium">Department</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {viewingInstructor.department || 'Institute Faculty Council'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                  <span className="text-slate-400 font-medium">Academic Qualification</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {viewingInstructor.educationLevel === 'PHD'
                      ? 'Doctor of Philosophy (PhD)'
                      : viewingInstructor.educationLevel === 'Master'
                      ? "Master's Degree"
                      : "Bachelor's Degree"}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                  <span className="text-slate-400 font-medium">Contact Email</span>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {viewingInstructor.email}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                  <span className="text-slate-400 font-medium">Phone & WhatsApp</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {viewingInstructor.phone || 'No direct phone'}
                    {viewingInstructor.whatsApp && ` • WA: ${viewingInstructor.whatsApp}`}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                  <span className="text-slate-400 font-medium">Contract Duration</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {viewingInstructor.contractLength || '2 Years'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                  <span className="text-slate-400 font-medium">Residential / Office Address</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {viewingInstructor.address || 'LIPA Faculty Quarters, Monrovia'}
                  </p>
                </div>
              </div>

              {/* Assigned Curricula */}
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-red-600" />
                  <span>Assigned Teaching Courses</span>
                </h5>
                {courses.filter(c => viewingInstructor.assignedCourseIds?.includes(c.id)).length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    No academic courses currently assigned to this faculty member.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {courses
                      .filter(c => viewingInstructor.assignedCourseIds?.includes(c.id))
                      .map(c => (
                        <div
                          key={c.id}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-red-600 dark:text-red-400 mr-2">
                              {c.code}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {c.title}
                            </span>
                          </div>
                          <div className="text-right text-slate-500 dark:text-slate-400">
                            <span>{c.credits} Credits</span>
                            {c.tuitionFee !== undefined && (
                              <span className="ml-2 font-mono text-slate-700 dark:text-slate-300">
                                (${(c.tuitionFee || 0).toLocaleString()})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const inst = viewingInstructor;
                  setViewingInstructor(null);
                  handlePrintSingle(inst);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Dossier</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const inst = viewingInstructor;
                    setViewingInstructor(null);
                    handleOpenEdit(inst);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition cursor-pointer"
                >
                  Edit Information
                </button>
                <button
                  type="button"
                  onClick={() => setViewingInstructor(null)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Instructor Details */}
      {editingInstructor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="font-bold text-base font-serif">
                    Edit Faculty Record: {editingInstructor.name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Faculty ID: {editingInstructor.facultyId || 'FAC-NEW'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingInstructor(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
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
                    Academic Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email *
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
                    Department *
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
                    Highest Education Level
                  </label>
                  <select
                    value={editEducation}
                    onChange={e => setEditEducation(e.target.value as EducationLevel)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="PHD">Doctorate (PhD)</option>
                    <option value="Master">Master's Degree</option>
                    <option value="Bachelor">Bachelor's Degree</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contract Term
                  </label>
                  <select
                    value={editContract}
                    onChange={e => setEditContract(e.target.value as ContractLength)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="Permanent">Permanent</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Service Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as UserProfile['status'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="active">Active (Teaching Service)</option>
                    <option value="leave">On Leave</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Course Assignment Selection */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Assigned Teaching Courses ({editCourses.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-1.5">
                  {courses.length === 0 ? (
                    <p className="text-slate-400 italic">No courses in academic catalog yet.</p>
                  ) : (
                    courses.map(c => {
                      const isChecked = editCourses.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCourseAssignment(c.id)}
                              className="rounded text-red-600 focus:ring-red-500"
                            />
                            <span className="font-mono font-bold text-red-600 dark:text-red-400">
                              {c.code}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200">
                              {c.title}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {c.credits} cr • {c.department}
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
                  onClick={() => setEditingInstructor(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition shadow-sm cursor-pointer"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print View (Visible during print mode for Single Instructor) */}
      {printingInstructor && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 text-black z-50">
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
            <h1 className="text-xl font-bold font-serif uppercase tracking-wider">
              Liberia Institute of Public Administration (LIPA)
            </h1>
            <h2 className="text-sm font-semibold text-slate-700 mt-0.5">
              Office of Academic Affairs • Faculty Dossier & Appointment Record
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Date Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 border border-slate-300 rounded-lg">
              <h3 className="font-bold text-sm uppercase text-slate-800 mb-2">
                Faculty Identification
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div><strong>Full Name:</strong> {printingInstructor.name}</div>
                <div><strong>Faculty ID:</strong> {printingInstructor.facultyId || 'FAC-NEW'}</div>
                <div><strong>Academic Title:</strong> {printingInstructor.title || 'Faculty Lecturer'}</div>
                <div><strong>Department:</strong> {printingInstructor.department || 'Institute Faculty Council'}</div>
                <div><strong>Email:</strong> {printingInstructor.email}</div>
                <div><strong>Phone / Contact:</strong> {printingInstructor.phone || 'N/A'}</div>
                <div><strong>Qualification:</strong> {printingInstructor.educationLevel || 'Master'}</div>
                <div><strong>Contract Term:</strong> {printingInstructor.contractLength || '2 Years'}</div>
              </div>
            </div>

            <div className="p-4 border border-slate-300 rounded-lg">
              <h3 className="font-bold text-sm uppercase text-slate-800 mb-2">
                Assigned Academic Courses
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-2">Course Code</th>
                    <th className="p-2">Course Title</th>
                    <th className="p-2">Department</th>
                    <th className="p-2">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {courses
                    .filter(c => printingInstructor.assignedCourseIds?.includes(c.id))
                    .map(c => (
                      <tr key={c.id} className="border-b border-slate-100">
                        <td className="p-2 font-mono font-bold">{c.code}</td>
                        <td className="p-2">{c.title}</td>
                        <td className="p-2">{c.department}</td>
                        <td className="p-2">{c.credits} Credits</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold">Academic Dean / Registrar</p>
                <p className="text-[11px] text-slate-500">Authorized Signature & Seal</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold">Faculty Member Signature</p>
                <p className="text-[11px] text-slate-500">Date Received</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
