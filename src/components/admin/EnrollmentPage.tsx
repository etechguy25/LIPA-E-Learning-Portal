import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { LearnType, EducationLevel, ContractLength, UserProfile } from '../../types';
import { LipaLogo } from '../common/LipaLogo';
import {
  UserPlus,
  GraduationCap,
  Briefcase,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Search,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Users,
  Building,
  Clock,
  Award,
  Filter,
  Shield,
  Printer,
  Receipt,
  X,
  DollarSign,
  FileText
} from 'lucide-react';

export interface EnrollmentReceiptData {
  receiptNumber: string;
  registrationDate: string;
  studentName: string;
  studentId: string;
  dob: string;
  gender: string;
  phone: string;
  whatsApp: string;
  email: string;
  address: string;
  learnType: string;
  courseCode: string;
  courseTitle: string;
  courseCredits: number;
  department: string;
  instructorName: string;
  schedule: string;
  room: string;
  tuitionFee: number;
  term: string;
}

interface EnrollmentPageProps {
  onNavigateToCourses?: () => void;
}

export const EnrollmentPage: React.FC<EnrollmentPageProps> = ({ onNavigateToCourses }) => {
  const {
    courses,
    usersDirectory,
    registerStudent,
    registerInstructor,
    updateUserStatus,
    settings
  } = useLms();

  // Active sub-tab inside Enrollment Page
  const [activeEnrollTab, setActiveEnrollTab] = useState<'student' | 'instructor' | 'roster'>('student');

  // Success Feedback state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Printable Registration & Enrollment Receipt State
  const [printableReceipt, setPrintableReceipt] = useState<EnrollmentReceiptData | null>(null);

  // ----------------------------------------------------
  // STUDENT REGISTRATION FORM STATE
  // ----------------------------------------------------
  const [studentName, setStudentName] = useState('');
  const [studentDob, setStudentDob] = useState('');
  const [studentGender, setStudentGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [studentAddress, setStudentAddress] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentWhatsApp, setStudentWhatsApp] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentCourseId, setStudentCourseId] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState(`STU-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [studentLearnType, setStudentLearnType] = useState<LearnType>('On Site');
  const [studentDepartment, setStudentDepartment] = useState('Public Administration');

  // Scholarship Selection State
  const [studentIsScholarship, setStudentIsScholarship] = useState(false);
  const [studentScholarshipType, setStudentScholarshipType] = useState('Full Institutional Academic Scholarship (100%)');
  const [studentScholarshipPercentage, setStudentScholarshipPercentage] = useState<number>(100);

  // Helper to copy phone to whatsapp
  const handleCopyPhoneToWhatsApp = () => {
    setStudentWhatsApp(studentPhone);
  };

  // ----------------------------------------------------
  // INSTRUCTOR REGISTRATION FORM STATE
  // ----------------------------------------------------
  const [instructorName, setInstructorName] = useState('');
  const [instructorDob, setInstructorDob] = useState('');
  const [instructorGender, setInstructorGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [instructorPhone, setInstructorPhone] = useState('');
  const [instructorWhatsApp, setInstructorWhatsApp] = useState('');
  const [instructorEduLevel, setInstructorEduLevel] = useState<EducationLevel>('Master');
  const [instructorAddress, setInstructorAddress] = useState('');
  const [instructorAssignedCourses, setInstructorAssignedCourses] = useState<string[]>([]);
  const [instructorEmail, setInstructorEmail] = useState('');
  const [instructorContract, setInstructorContract] = useState<ContractLength>('2years');
  const [instructorDepartment, setInstructorDepartment] = useState('Faculty Council');

  // Helper to toggle course selection for instructor
  const handleToggleCourse = (courseId: string) => {
    setInstructorAssignedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // ----------------------------------------------------
  // ROSTER SEARCH & FILTER
  // ----------------------------------------------------
  const [rosterFilterRole, setRosterFilterRole] = useState<'all' | 'student' | 'instructor'>('all');
  const [rosterSearch, setRosterSearch] = useState('');

  // ----------------------------------------------------
  // SUBMIT HANDLERS
  // ----------------------------------------------------
  const handlePrintStudentReceipt = (student: UserProfile) => {
    const courseId = student.selectedCourseId || student.assignedCourseIds?.[0];
    const enrolledCourse = courses.find(c => c.id === courseId);
    const standardTuition = enrolledCourse?.tuitionFee ?? (enrolledCourse ? enrolledCourse.credits * (settings.tuitionFeePerCredit || 1150) : 0);
    const calculatedTuition = student.totalDue !== undefined ? student.totalDue : standardTuition;

    const receipt: EnrollmentReceiptData = {
      receiptNumber: `ENR-${Date.now().toString().slice(-6)}`,
      registrationDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      studentName: student.name,
      studentId: student.studentId || student.id,
      dob: student.dateOfBirth || 'On File',
      gender: student.gender || 'Not Specified',
      phone: student.phone || 'N/A',
      whatsApp: student.whatsApp || 'N/A',
      email: student.email,
      address: student.address || 'Monrovia, Liberia',
      learnType: student.learnType || 'On Site',
      courseCode: enrolledCourse?.code || 'CRS-GEN',
      courseTitle: enrolledCourse?.title || student.selectedCourseName || 'Academic Curriculum Course',
      courseCredits: enrolledCourse?.credits || 3,
      department: enrolledCourse?.department || student.department || 'Public Administration',
      instructorName: enrolledCourse?.instructorName || 'Faculty Instructor',
      schedule: enrolledCourse?.schedule || 'Academic Term Schedule',
      room: enrolledCourse?.room || 'Executive Hall A',
      tuitionFee: calculatedTuition,
      term: settings.currentTerm || 'Fall 2026'
    };

    setPrintableReceipt(receipt);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) return;

    registerStudent({
      name: studentName.trim(),
      dateOfBirth: studentDob,
      gender: studentGender,
      address: studentAddress.trim(),
      phone: studentPhone.trim(),
      whatsApp: studentWhatsApp.trim(),
      email: studentEmail.trim(),
      selectedCourseId: studentCourseId,
      studentId: studentIdNumber.trim(),
      learnType: studentLearnType,
      department: studentDepartment,
      isScholarship: studentIsScholarship,
      scholarshipType: studentIsScholarship ? studentScholarshipType : undefined,
      scholarshipPercentage: studentIsScholarship ? studentScholarshipPercentage : undefined
    });

    const enrolledCourse = courses.find(c => c.id === studentCourseId);
    const standardTuition = enrolledCourse?.tuitionFee ?? (enrolledCourse ? enrolledCourse.credits * (settings.tuitionFeePerCredit || 1150) : 0);
    const waiver = studentIsScholarship ? (standardTuition * studentScholarshipPercentage) / 100 : 0;
    const finalTuition = Math.max(0, standardTuition - waiver);

    // Auto-generate official printable enrollment receipt
    const receiptData: EnrollmentReceiptData = {
      receiptNumber: `ENR-${Date.now().toString().slice(-6)}`,
      registrationDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      studentName: studentName.trim(),
      studentId: studentIdNumber.trim(),
      dob: studentDob || 'On File',
      gender: studentGender,
      phone: studentPhone.trim() || 'N/A',
      whatsApp: studentWhatsApp.trim() || 'N/A',
      email: studentEmail.trim(),
      address: studentAddress.trim() || 'Monrovia, Liberia',
      learnType: studentLearnType,
      courseCode: enrolledCourse?.code || 'CRS-GEN',
      courseTitle: enrolledCourse?.title || 'General Curriculum',
      courseCredits: enrolledCourse?.credits || 3,
      department: enrolledCourse?.department || studentDepartment || 'Public Administration',
      instructorName: enrolledCourse?.instructorName || 'Faculty Instructor',
      schedule: enrolledCourse?.schedule || 'Academic Term Schedule',
      room: enrolledCourse?.room || 'Executive Hall A',
      tuitionFee: finalTuition,
      term: settings.currentTerm || 'Fall 2026'
    };

    setPrintableReceipt(receiptData);

    setSuccessMessage(
      `Student ${studentName} successfully matriculated with ID ${studentIdNumber}${
        enrolledCourse ? ` and enrolled in ${enrolledCourse.code}` : ''
      }${studentIsScholarship ? ` [${studentScholarshipType}]` : ''}. Receipt generated for printing!`
    );

    // Reset form
    setStudentName('');
    setStudentDob('');
    setStudentAddress('');
    setStudentPhone('');
    setStudentWhatsApp('');
    setStudentEmail('');
    setStudentCourseId('');
    setStudentIsScholarship(false);
    setStudentPhone('');
    setStudentWhatsApp('');
    setStudentEmail('');
    setStudentCourseId('');
    setStudentIdNumber(`STU-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setStudentLearnType('On Site');

    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const handleInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructorName.trim() || !instructorEmail.trim()) return;

    registerInstructor({
      name: instructorName.trim(),
      dateOfBirth: instructorDob,
      gender: instructorGender,
      phone: instructorPhone.trim(),
      whatsApp: instructorWhatsApp.trim(),
      educationLevel: instructorEduLevel,
      address: instructorAddress.trim(),
      assignedCourseIds: instructorAssignedCourses,
      email: instructorEmail.trim(),
      contractLength: instructorContract,
      department: instructorDepartment
    });

    setSuccessMessage(
      `Instructor ${instructorName} (${instructorEduLevel}) successfully registered and assigned to ${instructorAssignedCourses.length} course(s).`
    );

    // Reset form
    setInstructorName('');
    setInstructorDob('');
    setInstructorPhone('');
    setInstructorWhatsApp('');
    setInstructorAddress('');
    setInstructorEmail('');
    setInstructorAssignedCourses([]);
    setInstructorEduLevel('Master');
    setInstructorContract('2years');

    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Filtered users for the roster tab
  const filteredRoster = usersDirectory.filter(u => {
    const matchesRole = rosterFilterRole === 'all' || u.role === rosterFilterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(rosterSearch.toLowerCase())) ||
      (u.facultyId && u.facultyId.toLowerCase().includes(rosterSearch.toLowerCase())) ||
      (u.phone && u.phone.toLowerCase().includes(rosterSearch.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(rosterSearch.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const enrolledStudents = usersDirectory.filter(u => u.role === 'student');
  const registeredInstructors = usersDirectory.filter(u => u.role === 'instructor');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Institutional Admin Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f2347] via-[#142c54] to-[#0a1931] text-white p-6 sm:p-7 shadow-sm border border-[#1e3a8a]/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/20 text-red-300 border border-red-500/30">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Administrative Exclusive • Manual Admissions &amp; Appointment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
              Student &amp; Teacher Registration
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Official institutional portal for manual student enrollment, course assignment, faculty appointments, and credentialing. All enrollments are administered manually by academic administration.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 backdrop-blur-xs px-4 py-3 rounded-xl border border-red-500/30 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-red-300 block tracking-wider">
                Total Students
              </span>
              <span className="text-xl font-extrabold text-white font-mono">
                {enrolledStudents.length}
              </span>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xs px-4 py-3 rounded-xl border border-blue-400/30 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-blue-300 block tracking-wider">
                Total Faculty
              </span>
              <span className="text-xl font-extrabold text-white font-mono">
                {registeredInstructors.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs for Enrollment Sections */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2 bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveEnrollTab('student')}
            id="enroll-tab-student"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeEnrollTab === 'student'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Registration</span>
          </button>

          <button
            onClick={() => setActiveEnrollTab('instructor')}
            id="enroll-tab-instructor"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeEnrollTab === 'instructor'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Instructor Registration</span>
          </button>

          <button
            onClick={() => setActiveEnrollTab('roster')}
            id="enroll-tab-roster"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeEnrollTab === 'roster'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Official Roster ({usersDirectory.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-red-600" />
          <span>Academic Term: <strong>{settings.currentTerm}</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: STUDENT REGISTRATION FORM */}
      {/* ========================================================================= */}
      {activeEnrollTab === 'student' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Student Enrollment &amp; Registration Form
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete the official student profile. Select the course from the available institutional catalog to link academic schedules and tuition billing.
            </p>
          </div>

          <form onSubmit={handleStudentSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Student Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Student Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marie K. Freeman"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  id="student-reg-name"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                />
              </div>

              {/* 2. Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={studentDob}
                  onChange={e => setStudentDob(e.target.value)}
                  id="student-reg-dob"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                />
              </div>

              {/* 3. Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={studentGender}
                  onChange={e => setStudentGender(e.target.value as any)}
                  id="student-reg-gender"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* 4. Student ID Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Student ID Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentIdNumber}
                  onChange={e => setStudentIdNumber(e.target.value)}
                  id="student-reg-id"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-slate-50 text-slate-900"
                />
              </div>

              {/* 5. Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@lipa.edu.lr"
                  value={studentEmail}
                  onChange={e => setStudentEmail(e.target.value)}
                  id="student-reg-email"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                />
              </div>

              {/* 6. Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+231 77 123 4567"
                  value={studentPhone}
                  onChange={e => setStudentPhone(e.target.value)}
                  id="student-reg-phone"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                />
              </div>

              {/* 7. WhatsApp Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  {studentPhone && (
                    <button
                      type="button"
                      onClick={handleCopyPhoneToWhatsApp}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      Same as phone
                    </button>
                  )}
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+231 77 123 4567"
                  value={studentWhatsApp}
                  onChange={e => setStudentWhatsApp(e.target.value)}
                  id="student-reg-whatsapp"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                />
              </div>

              {/* 8. Select Course (Dynamic from inputed courses) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Course <span className="text-red-500">*</span>
                </label>
                {courses.length === 0 ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 text-red-700" />
                      <span>No Courses Inputted Yet</span>
                    </div>
                    <p className="text-[11px] text-red-700">
                      Please add academic courses first in Course Creation &amp; Catalog before enrolling students.
                    </p>
                    {onNavigateToCourses && (
                      <button
                        type="button"
                        onClick={onNavigateToCourses}
                        className="inline-flex items-center space-x-1 font-bold text-red-900 underline text-[11px] mt-1 cursor-pointer"
                      >
                        <span>Go to Course Creation</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <select
                      required
                      value={studentCourseId}
                      onChange={e => {
                        const cid = e.target.value;
                        setStudentCourseId(cid);
                        const found = courses.find(c => c.id === cid);
                        if (found) setStudentDepartment(found.department);
                      }}
                      id="student-reg-course"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white font-medium cursor-pointer"
                    >
                      <option value="">-- Choose Course from Catalog --</option>
                      {courses.map(c => {
                        const fee = c.tuitionFee ?? ((c.credits || 0) * (settings?.tuitionFeePerCredit || 1150));
                        return (
                          <option key={c.id} value={c.id}>
                            {c.code} - {c.title} (Tuition: ${(fee || 0).toLocaleString()} • {c.credits} Credits • {c.department})
                          </option>
                        );
                      })}
                    </select>

                    {studentCourseId && (
                      <div className="mt-2 p-2.5 bg-red-50 rounded-xl border border-red-200 text-xs flex items-center justify-between">
                        <span className="text-slate-700 font-medium">Assessed Fixed Tuition (Amount Due):</span>
                        <span className="font-bold text-red-700 font-mono text-sm">
                          ${(() => {
                            const found = courses.find(c => c.id === studentCourseId);
                            const calculated = found ? (found.tuitionFee ?? ((found.credits || 0) * (settings?.tuitionFeePerCredit || 1150))) : 0;
                            return (calculated || 0).toLocaleString();
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 9. Learn Type (Online, On Site, Hybrid) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Learn Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={studentLearnType}
                  onChange={e => setStudentLearnType(e.target.value as LearnType)}
                  id="student-reg-learntype"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white font-medium cursor-pointer"
                >
                  <option value="Online">Online</option>
                  <option value="On Site">On Site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* 10. Select Course Option Reflecting Registered Course & Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Course &amp; Department <span className="text-slate-400 font-normal">(Reflects Registered Course)</span>
                </label>
                <select
                  value={studentCourseId}
                  onChange={e => {
                    const cid = e.target.value;
                    setStudentCourseId(cid);
                    const matched = courses.find(c => c.id === cid);
                    if (matched) {
                      setStudentDepartment(matched.department);
                    }
                  }}
                  id="student-reg-department"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white font-medium cursor-pointer"
                >
                  <option value="">-- Select Course (Department Syncs Automatically) --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.department} &bull; {c.code} - {c.title}
                    </option>
                  ))}
                </select>
                {studentDepartment && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Department of Registered Course:</span>
                    <strong className="text-red-700 font-semibold">{studentDepartment}</strong>
                  </div>
                )}
              </div>

              {/* 11. Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Residential / Postal Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mamba Point, UN Drive, Monrovia, Liberia"
                  value={studentAddress}
                  onChange={e => setStudentAddress(e.target.value)}
                  id="student-reg-address"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                />
              </div>

              {/* 12. Scholarship Option */}
              <div className="md:col-span-3 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 rounded-2xl p-4 sm:p-5 border border-amber-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          Scholarship &amp; Financial Aid Option
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60">
                          Tuition Waiver
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Enable if this matriculating student is granted an institutional or government scholarship award.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={studentIsScholarship}
                      onChange={e => {
                        const checked = e.target.checked;
                        setStudentIsScholarship(checked);
                        if (checked && !studentScholarshipPercentage) {
                          setStudentScholarshipPercentage(100);
                        }
                      }}
                      id="student-reg-scholarship-toggle"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    <span className="ml-2.5 text-xs font-bold text-slate-800">
                      {studentIsScholarship ? 'Scholarship Applied' : 'No Scholarship'}
                    </span>
                  </label>
                </div>

                {studentIsScholarship && (
                  <div className="pt-3 border-t border-amber-200/60 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Scholarship Award Program <span className="text-amber-600">*</span>
                      </label>
                      <select
                        value={studentScholarshipType}
                        onChange={e => {
                          const val = e.target.value;
                          setStudentScholarshipType(val);
                          if (val.includes('100%')) setStudentScholarshipPercentage(100);
                          else if (val.includes('75%')) setStudentScholarshipPercentage(75);
                          else if (val.includes('50%')) setStudentScholarshipPercentage(50);
                          else if (val.includes('25%')) setStudentScholarshipPercentage(25);
                        }}
                        id="student-reg-scholarship-type"
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden bg-white font-medium"
                      >
                        <option value="Full Institutional Academic Scholarship (100%)">
                          Full Institutional Academic Scholarship (100% Tuition Waived)
                        </option>
                        <option value="Government Civil Service Merit Fellowship (100%)">
                          Government Civil Service Merit Fellowship (100% Waived)
                        </option>
                        <option value="Public Sector Capacity Grant (75%)">
                          Public Sector Capacity Grant (75% Waived)
                        </option>
                        <option value="Partial Presidential Fellowship (50%)">
                          Partial Presidential Fellowship (50% Waived)
                        </option>
                        <option value="Community & County Merit Grant (25%)">
                          Community &amp; County Merit Grant (25% Waived)
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Waiver Coverage Percentage
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[100, 75, 50, 25].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setStudentScholarshipPercentage(pct)}
                            id={`scholarship-pct-${pct}`}
                            className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              studentScholarshipPercentage === pct
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                            }`}
                          >
                            {pct}% Waived
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Financial Breakdown for Scholarship */}
                    {studentCourseId && (
                      <div className="md:col-span-2 p-3 bg-amber-100/70 border border-amber-300/80 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 text-amber-950 font-medium">
                          <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>
                            {studentScholarshipPercentage === 100
                              ? '100% Tuition Waived: Student portal will be activated immediately upon registration with $0 balance.'
                              : `${studentScholarshipPercentage}% Partial Scholarship Applied. Remaining tuition due will be billed to student.`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 font-mono text-xs">
                          {(() => {
                            const c = courses.find(item => item.id === studentCourseId);
                            const base = c?.tuitionFee ?? (c ? c.credits * (settings.tuitionFeePerCredit || 1150) : 0);
                            const discount = (base * studentScholarshipPercentage) / 100;
                            const finalAmt = Math.max(0, base - discount);
                            return (
                              <>
                                <span className="text-slate-500 line-through">Base: ${(base || 0).toLocaleString()}</span>
                                <span className="text-amber-800 font-semibold">-{studentScholarshipPercentage}% (-${(discount || 0).toLocaleString()})</span>
                                <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-300">
                                  Balance Due: ${(finalAmt || 0).toLocaleString()}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                <ShieldIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Manual Enrollment • Updates tuition ledger and student timetable automatically.</span>
              </div>
              <button
                type="submit"
                id="submit-student-registration-btn"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Enroll Student</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: INSTRUCTOR REGISTRATION FORM */}
      {/* ========================================================================= */}
      {activeEnrollTab === 'instructor' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a]"></span>
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Instructor &amp; Faculty Registration Form
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Appoint faculty instructors, define education credentials, specify contract length, and assign multiple academic courses from the catalog.
            </p>
          </div>

          <form onSubmit={handleInstructorSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Instructor Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Instructor Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Samuel B. Cooper"
                  value={instructorName}
                  onChange={e => setInstructorName(e.target.value)}
                  id="instructor-reg-name"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-hidden"
                />
              </div>

              {/* 2. Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={instructorDob}
                  onChange={e => setInstructorDob(e.target.value)}
                  id="instructor-reg-dob"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-hidden"
                />
              </div>

              {/* 3. Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={instructorGender}
                  onChange={e => setInstructorGender(e.target.value as any)}
                  id="instructor-reg-gender"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-hidden bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* 4. Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+231 88 456 7890"
                  value={instructorPhone}
                  onChange={e => setInstructorPhone(e.target.value)}
                  id="instructor-reg-phone"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-hidden"
                />
              </div>

              {/* 5. WhatsApp Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  {instructorPhone && (
                    <button
                      type="button"
                      onClick={() => setInstructorWhatsApp(instructorPhone)}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Same as phone
                    </button>
                  )}
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+231 88 456 7890"
                  value={instructorWhatsApp}
                  onChange={e => setInstructorWhatsApp(e.target.value)}
                  id="instructor-reg-whatsapp"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-hidden"
                />
              </div>

              {/* 6. Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="faculty@lipa.edu.lr"
                  value={instructorEmail}
                  onChange={e => setInstructorEmail(e.target.value)}
                  id="instructor-reg-email"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-hidden"
                />
              </div>

              {/* 7. Level of Education (BSC, Master, PHD) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Level of Education <span className="text-red-500">*</span>
                </label>
                <select
                  value={instructorEduLevel}
                  onChange={e => setInstructorEduLevel(e.target.value as EducationLevel)}
                  id="instructor-reg-edulevel"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-hidden bg-white font-medium"
                >
                  <option value="BSC">BSC (Bachelor of Science)</option>
                  <option value="Master">Master (Master of Science / Arts)</option>
                  <option value="PHD">PHD (Doctor of Philosophy)</option>
                </select>
              </div>

              {/* 8. Contract Length (1year, 2years, 3years, 4years, 5years, Full Time) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Contract Length <span className="text-red-500">*</span>
                </label>
                <select
                  value={instructorContract}
                  onChange={e => setInstructorContract(e.target.value as ContractLength)}
                  id="instructor-reg-contract"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-hidden bg-white font-medium"
                >
                  <option value="1year">1 Year Fixed Term</option>
                  <option value="2years">2 Years Fixed Term</option>
                  <option value="3years">3 Years Fixed Term</option>
                  <option value="4years">4 Years Fixed Term</option>
                  <option value="5years">5 Years Fixed Term</option>
                  <option value="Full Time">Full Time Tenured Appointment</option>
                </select>
              </div>

              {/* 9. Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Faculty Department
                </label>
                <select
                  value={instructorDepartment}
                  onChange={e => setInstructorDepartment(e.target.value)}
                  id="instructor-reg-dept"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-hidden bg-white"
                >
                  <option value="Faculty Council">Faculty Council</option>
                  <option value="Public Administration">Public Administration</option>
                  <option value="Policy Governance">Policy Governance</option>
                  <option value="Public Financial Management">Public Financial Management</option>
                  <option value="Information Systems">Information Systems</option>
                </select>
              </div>

              {/* 10. Address */}
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Faculty Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sinkor Old Road, Tubman Boulevard, Monrovia, Liberia"
                  value={instructorAddress}
                  onChange={e => setInstructorAddress(e.target.value)}
                  id="instructor-reg-address"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-hidden"
                />
              </div>
            </div>

            {/* 11. Assign Courses (Allows instructor to be assigned to multiple selected courses) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-900 block">
                    Assign Courses (Instructor can teach multiple courses)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Check all courses this instructor will lead. Assigned courses will update their faculty lead in the catalog.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {instructorAssignedCourses.length} selected
                </span>
              </div>

              {courses.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-1.5">
                  <BookOpen className="w-5 h-5 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No Courses in Catalog Yet</p>
                  <p className="text-[11px] text-slate-500">
                    Input courses in Course Creation &amp; Catalog first to assign them to instructors.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                  {courses.map(course => {
                    const isChecked = instructorAssignedCourses.includes(course.id);
                    return (
                      <label
                        key={course.id}
                        className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'border-[#1e3a8a] bg-blue-50/70 shadow-xs ring-1 ring-[#1e3a8a]'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCourse(course.id)}
                          className="mt-0.5 rounded text-[#1e3a8a] focus:ring-[#1e3a8a] w-4 h-4"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {course.code}
                            </span>
                            <span className="truncate">{course.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {course.credits} Credits • {course.department}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                <ShieldIcon className="w-3.5 h-3.5 text-[#1e3a8a]" />
                <span>Admin Faculty Appointment • Updates course catalog and faculty roster automatically.</span>
              </div>
              <button
                type="submit"
                id="submit-instructor-registration-btn"
                className="px-6 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>Register &amp; Appoint Instructor</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: OFFICIAL ENROLLMENT ROSTER */}
      {/* ========================================================================= */}
      {activeEnrollTab === 'roster' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Official Institutional Roster
              </h2>
              <p className="text-xs text-slate-500">
                All students matriculated and faculty appointed manually by administration.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search roster..."
                  value={rosterSearch}
                  onChange={e => setRosterSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-hidden w-48 sm:w-60"
                />
              </div>

              {/* Role filter */}
              <select
                value={rosterFilterRole}
                onChange={e => setRosterFilterRole(e.target.value as any)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white font-medium outline-hidden"
              >
                <option value="all">All Roles</option>
                <option value="student">Students ({enrolledStudents.length})</option>
                <option value="instructor">Instructors ({registeredInstructors.length})</option>
              </select>
            </div>
          </div>

          {filteredRoster.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No User Records in Roster</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No students or instructors have been registered yet. Use the registration tabs above to enroll your first student or instructor.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                    <th className="py-3 px-4">Name &amp; Role</th>
                    <th className="py-3 px-3">Official ID</th>
                    <th className="py-3 px-3">Contact Details</th>
                    <th className="py-3 px-3">Details / Learn Type</th>
                    <th className="py-3 px-3">Assigned Course(s)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoster.map(user => {
                    const isStudent = user.role === 'student';
                    const assignedCoursesNames = user.assignedCourseIds
                      ? courses
                          .filter(c => user.assignedCourseIds?.includes(c.id))
                          .map(c => c.code)
                          .join(', ')
                      : null;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            {user.role === 'admin' || !user.avatar ? (
                              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-red-500/30">
                                <Shield className="w-4 h-4" />
                              </div>
                            ) : (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            )}
                            <div>
                              <div className="font-bold text-slate-900">{user.name}</div>
                              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                                <span className={`capitalize font-semibold ${
                                  isStudent ? 'text-red-700' : 'text-blue-700'
                                }`}>
                                  {user.role}
                                </span>
                                <span>•</span>
                                <span>{user.department}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                          {user.studentId || user.facultyId || '-'}
                        </td>

                        <td className="py-3.5 px-3 space-y-0.5">
                          <div className="text-slate-700">{user.email}</div>
                          {user.phone && (
                            <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.whatsApp && (
                            <div className="text-[11px] text-emerald-600 flex items-center space-x-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp: {user.whatsApp}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          {isStudent ? (
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-900">
                                {user.learnType || 'On Site'}
                              </span>
                              {user.dateOfBirth && (
                                <div className="text-[10px] text-slate-400 mt-1">
                                  DOB: {user.dateOfBirth}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                                {user.educationLevel || 'Faculty'} • {user.contractLength || 'Term'}
                              </span>
                              {user.dateOfBirth && (
                                <div className="text-[10px] text-slate-400 mt-1">
                                  DOB: {user.dateOfBirth}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          {isStudent ? (
                            <span className="font-semibold text-slate-800">
                              {user.selectedCourseName || (user.selectedCourseId ? courses.find(c => c.id === user.selectedCourseId)?.code : 'Curriculum')}
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-800">
                              {assignedCoursesNames || (user.assignedCourseIds && user.assignedCourseIds.length > 0 ? `${user.assignedCourseIds.length} course(s)` : 'General Faculty')}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              user.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : user.status === 'inactive'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isStudent && (
                              <button
                                type="button"
                                onClick={() => handlePrintStudentReceipt(user)}
                                title="Print Student Registration & Enrollment Receipt"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Receipt</span>
                              </button>
                            )}
                            <select
                              value={user.status}
                              onChange={e => updateUserStatus(user.id, e.target.value as any)}
                              className="text-[11px] border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium cursor-pointer"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="leave">Leave</option>
                              <option value="suspended">Suspended</option>
                            </select>
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
      )}

      {/* Official Student Registration & Enrollment Receipt Modal */}
      {printableReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0 print:hidden">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-red-600" />
                  Official Student Registration &amp; Enrollment Receipt
                </span>
                <span className="text-xs text-slate-500 font-mono">Ref: {printableReceipt.receiptNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  id="print-enrollment-receipt-btn"
                  className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print Receipt / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPrintableReceipt(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-8 space-y-6 overflow-y-auto" id="printable-enrollment-receipt">
              {/* Institution Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div className="flex items-center space-x-4">
                  <LipaLogo size="lg" variant="badge" />
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 font-serif">
                      LIBERIA INSTITUTE OF PUBLIC ADMINISTRATION
                    </h1>
                    <p className="text-xs text-slate-600 font-medium tracking-wide uppercase">
                      Office of the Registrar &amp; Admissions • Official Matriculation Certificate
                    </p>
                    <p className="text-xs text-slate-400 italic">
                      Official Registration &amp; Course Enrollment Receipt • registrar@lipa.gov.lr
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">Receipt No.</span>
                  <p className="text-sm font-bold font-mono text-slate-900">{printableReceipt.receiptNumber}</p>
                  <p className="text-xs text-slate-500 mt-1">Date: {printableReceipt.registrationDate}</p>
                </div>
              </div>

              {/* Student Identification Profile */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-red-600" />
                  Student Identification &amp; Contact Record
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Student Name</span>
                    <strong className="text-slate-900 text-sm font-serif">{printableReceipt.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Student ID</span>
                    <strong className="text-blue-900 font-mono text-sm">{printableReceipt.studentId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Delivery Mode</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[11px] mt-0.5">
                      {printableReceipt.learnType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email Address</span>
                    <span className="text-slate-700 font-medium">{printableReceipt.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone / WhatsApp</span>
                    <span className="text-slate-700 font-mono">
                      {printableReceipt.phone} {printableReceipt.whatsApp && printableReceipt.whatsApp !== printableReceipt.phone ? `/ WA: ${printableReceipt.whatsApp}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Residential Address</span>
                    <span className="text-slate-700">{printableReceipt.address}</span>
                  </div>
                </div>
              </div>

              {/* Course Matriculation & Academic Assignment */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>Registered Academic Course Details</span>
                  <span className="font-mono text-slate-500 font-normal">Term: {printableReceipt.term}</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Course Code &amp; Title</th>
                      <th className="py-2.5 px-3">Academic Department</th>
                      <th className="py-2.5 px-3">Instructor</th>
                      <th className="py-2.5 px-3">Room &amp; Schedule</th>
                      <th className="py-2.5 px-3 text-right">Credits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{printableReceipt.courseTitle}</div>
                        <div className="font-mono text-red-600 text-[11px]">{printableReceipt.courseCode}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{printableReceipt.department}</td>
                      <td className="py-3 px-3 text-slate-700">{printableReceipt.instructorName}</td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{printableReceipt.room}</div>
                        <div className="text-[11px] text-slate-400">{printableReceipt.schedule}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {printableReceipt.courseCredits} CR
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Assessment & Bursar Assessment */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-slate-700">Financial Assessment Ledger</h4>
                  <p className="text-slate-500">
                    Fixed Course Tuition assessed per approved academic catalog schedule.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Accepted payment channels: Credit Card, Mobile Money, or Direct Cash in Person at Bursar window.
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-right min-w-[190px]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Fixed Tuition Amount Due
                  </span>
                  <p className="text-2xl font-mono font-extrabold text-red-600 mt-0.5">
                    ${(printableReceipt?.tuitionFee || 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1">
                    Pending Bursar Settlement
                  </span>
                </div>
              </div>

              {/* Official Seal and Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-10 text-center text-xs">
                <div className="border-t border-slate-500 pt-2">
                  <p className="font-bold text-slate-900">Registrar &amp; Dean of Admissions</p>
                  <p className="text-[11px] text-slate-500">Authorized Signature &amp; Official Matriculation Seal</p>
                </div>
                <div className="border-t border-slate-500 pt-2">
                  <p className="font-bold text-slate-900">Chief Bursar &amp; Financial Comptroller</p>
                  <p className="text-[11px] text-slate-500">Tuition Assessment Validation &amp; Official Seal</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0 print:hidden">
              <span>Liberia Institute of Public Administration • Official Student Enrollment Receipt</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors cursor-pointer"
                >
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setPrintableReceipt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper icon
const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);
