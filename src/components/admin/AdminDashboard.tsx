import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { LipaLogo } from '../common/LipaLogo';
import {
  BarChart3,
  FileSpreadsheet,
  Users,
  UserCheck,
  UserX,
  Layers,
  Settings,
  TrendingUp,
  CreditCard,
  GraduationCap,
  Award,
  Plus,
  X,
  Check,
  Shield,
  Search,
  Filter,
  Download,
  AlertCircle,
  Clock,
  DollarSign,
  PieChart as PieChartIcon,
  CheckCircle2,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Edit3,
  Trash2,
  ExternalLink,
  Upload,
  ShieldCheck
} from 'lucide-react';
import { EnrollmentPage } from './EnrollmentPage';
import { AllStudentsPage } from './AllStudentsPage';
import { AllInstructorsPage } from './AllInstructorsPage';
import { AdminFinancialPage } from './AdminFinancialPage';
import { InstructorActivityMonitor } from './InstructorActivityMonitor';
import { StudentPerformanceAnalytics } from './StudentPerformanceAnalytics';
import { DatabaseSchemaPage } from './DatabaseSchemaPage';
import { ActivityLogViewer } from './ActivityLogViewer';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Course, UserProfile, CourseMode } from '../../types';

interface AdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCreateCourseModalOpen: boolean;
  setIsCreateCourseModalOpen: (open: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab,
  setActiveTab,
  isCreateCourseModalOpen,
  setIsCreateCourseModalOpen
}) => {
  const {
    currentUser,
    courses,
    usersDirectory,
    analytics,
    settings,
    createCourse,
    editCourse,
    deleteCourse,
    bulkEnrollStudentsInCourses,
    openClassroom,
    addUser,
    updateUserStatus,
    updateSettings,
    addCourseMaterial
  } = useLms();

  // Upload School Materials State
  const [isUploadMaterialOpen, setIsUploadMaterialOpen] = useState(false);
  const [materialCourseId, setMaterialCourseId] = useState<string>('ALL');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<'document' | 'video' | 'youtube' | 'link'>('document');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialFileSize, setMaterialFileSize] = useState('2.5 MB PDF');
  const [materialSuccessMsg, setMaterialSuccessMsg] = useState<string | null>(null);

  const handleUploadMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim()) return;

    addCourseMaterial({
      courseId: materialCourseId,
      title: materialTitle.trim(),
      type: materialType,
      url: materialUrl.trim() || 'https://lipa.gov.lr/materials/academic-resource.pdf',
      description: materialDescription.trim(),
      fileSize: materialFileSize.trim() || '2.5 MB',
      uploadedBy: 'School Administration'
    });

    const targetLabel = materialCourseId === 'ALL'
      ? 'All Classes & Faculty (School-Wide Distribution)'
      : courses.find(c => c.id === materialCourseId)?.title || 'Selected Class';

    setMaterialSuccessMsg(`School material "${materialTitle}" was successfully uploaded to ${targetLabel}!`);
    setMaterialTitle('');
    setMaterialUrl('');
    setMaterialDescription('');
    setIsUploadMaterialOpen(false);
    setTimeout(() => setMaterialSuccessMsg(null), 5000);
  };

  // Bulk Course & Student Selection State
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isBulkEnrollModalOpen, setIsBulkEnrollModalOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkStudentSearch, setBulkStudentSearch] = useState('');
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState<string | null>(null);

  // User Filter State
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'instructor' | 'admin'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [studentGenderFilter, setStudentGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [genderChartView, setGenderChartView] = useState<'status' | 'department'>('status');

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'instructor'>('student');
  const [newUserGender, setNewUserGender] = useState<'Male' | 'Female'>('Male');
  const [newUserStatus, setNewUserStatus] = useState<UserProfile['status']>('active');
  const [newUserDepartment, setNewUserDepartment] = useState('School of Public Administration');

  // Create Course Modal State
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseClassroom, setCourseClassroom] = useState('Room 101');
  const [courseTuitionFee, setCourseTuitionFee] = useState('3450');
  const [courseInstructor, setCourseInstructor] = useState('Prof. Arthur Townsend');
  const [courseCapacity, setCourseCapacity] = useState('45');
  const [courseLocation, setCourseLocation] = useState<'On-site' | 'Online'>('On-site');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseDuration, setCourseDuration] = useState('14 Weeks');

  // Edit Course Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseClassroom, setEditCourseClassroom] = useState('');
  const [editCourseTuitionFee, setEditCourseTuitionFee] = useState('3450');
  const [editCourseInstructor, setEditCourseInstructor] = useState('');
  const [editCourseCapacity, setEditCourseCapacity] = useState('45');
  const [editCourseLocation, setEditCourseLocation] = useState<'On-site' | 'Online'>('On-site');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [editCourseDuration, setEditCourseDuration] = useState('14 Weeks');

  // Course Management Dropdown Filter
  const [courseCatalogFilter, setCourseCatalogFilter] = useState<string>('all');

  // System Settings State
  const [instName, setInstName] = useState(settings.institutionName);
  const [termName, setTermName] = useState(settings.currentTerm);
  const [regOpen, setRegOpen] = useState(settings.registrationOpen);
  const [tuitionRate, setTuitionRate] = useState(String(settings.tuitionFeePerCredit));
  const [announcement, setAnnouncement] = useState(settings.announcementBanner);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Derived Metrics for Required Admin Dashboard
  const students = usersDirectory.filter(u => u.role === 'student');
  const totalEnrolledStudents = students.length;

  const activeStudents = students.filter(u => u.status === 'active').length;
  const inactiveStudents = students.filter(u => u.status === 'inactive' || u.status === 'leave' || u.status === 'suspended').length;
  const activePercentage = totalEnrolledStudents > 0 ? Math.round((activeStudents / totalEnrolledStudents) * 100) : 0;
  const inactivePercentage = totalEnrolledStudents > 0 ? 100 - activePercentage : 0;

  const maleStudents = students.filter(u => u.gender === 'Male').length;
  const femaleStudents = students.filter(u => u.gender === 'Female').length;
  const malePercentage = totalEnrolledStudents > 0 ? Math.round((maleStudents / totalEnrolledStudents) * 100) : 0;
  const femalePercentage = totalEnrolledStudents > 0 ? Math.round((femaleStudents / totalEnrolledStudents) * 100) : 0;

  const instructors = usersDirectory.filter(u => u.role === 'instructor');
  const totalInstructors = instructors.length;
  const totalCourses = courses.length;

  // Financial Metrics
  const totalIncome = analytics.totalTuitionCollected || 0;
  const pendingPayments = analytics.totalOutstandingBalance || 0;
  const totalRevenueGenerated = analytics.totalTuitionBilled > 0 ? analytics.totalTuitionBilled : (totalIncome + pendingPayments);
  const collectionPercentage = totalRevenueGenerated > 0 ? Math.round((totalIncome / totalRevenueGenerated) * 100) : 0;
  const pendingPercentage = totalRevenueGenerated > 0 ? (100 - collectionPercentage) : 0;

  // Charts Data for Male & Female Students
  const genderPieData = [
    { name: 'Male Students', value: maleStudents, color: '#2563eb' },
    { name: 'Female Students', value: femaleStudents, color: '#0d9488' }
  ];

  const activeMale = students.filter(u => u.gender === 'Male' && u.status === 'active').length;
  const inactiveMale = students.filter(u => u.gender === 'Male' && u.status !== 'active').length;
  const activeFemale = students.filter(u => u.gender === 'Female' && u.status === 'active').length;
  const inactiveFemale = students.filter(u => u.gender === 'Female' && u.status !== 'active').length;

  const genderStatusBarData = [
    {
      name: 'Male Students',
      Active: activeMale,
      Inactive: inactiveMale,
      Total: maleStudents
    },
    {
      name: 'Female Students',
      Active: activeFemale,
      Inactive: inactiveFemale,
      Total: femaleStudents
    }
  ];

  const uniqueDepts: string[] = Array.from(new Set(students.map(s => s.department || 'General')));
  const genderDeptBarData = uniqueDepts.map((dept: string) => {
    const shortName = (dept || '').replace('Department of ', '').replace('School of ', '');
    return {
      department: shortName.length > 18 ? shortName.substring(0, 16) + '...' : shortName,
      fullName: dept,
      Male: students.filter(s => s.department === dept && s.gender === 'Male').length,
      Female: students.filter(s => s.department === dept && s.gender === 'Female').length
    };
  });

  // Dynamic Demographics Cohorts from registered students
  const studentMajors = Array.from(new Set(students.map(s => s.major || s.department || 'General Studies')));
  const cohortPalette = ['#1e3a8a', '#047857', '#0284c7', '#7c3aed', '#b45309', '#e11d48'];
  const dynamicDemographics = studentMajors.map((major, idx) => ({
    name: major,
    value: students.filter(s => (s.major || s.department || 'General Studies') === major).length,
    color: cohortPalette[idx % cohortPalette.length]
  }));

  // Dynamic Department Performance from courses & students
  const departmentCatalog = Array.from(new Set([
    ...courses.map(c => c.department),
    ...students.map(s => s.department || '')
  ])).filter(Boolean);

  const dynamicDeptMetrics = departmentCatalog.map(deptName => {
    const deptStudents = students.filter(s => (s.department || '') === deptName).length;
    const deptCourses = courses.filter(c => c.department === deptName);
    const capacity = deptCourses.reduce((sum, c) => sum + (c.capacity || 0), 0);
    const enrolled = deptCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
    return {
      department: deptName,
      students: deptStudents,
      courses: deptCourses.length,
      capacity: capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0,
      completion: deptCourses.length > 0 ? 100 : 0
    };
  });

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseTitle.trim()) return;

    const matchedInstructor = instructors.find(i => i.name === courseInstructor) || instructors[0];

    const newCrs = createCourse({
      code: courseCode.toUpperCase(),
      title: courseTitle,
      department: courseClassroom || 'Academic Studies',
      classroom: courseClassroom,
      credits: 3,
      tuitionFee: parseFloat(courseTuitionFee) || 3450,
      instructorId: matchedInstructor?.id || 'usr_instructor_01',
      instructorName: courseInstructor || matchedInstructor?.name || 'Faculty Lead',
      schedule: courseLocation === 'Online' ? 'Online Flexible & Virtual Meetings' : 'Tue / Thu 10:00 AM - 11:30 AM',
      room: courseClassroom || (courseLocation === 'Online' ? 'Virtual Classroom' : 'Academic Hall 101'),
      location: courseLocation,
      color: '#1e3a8a',
      capacity: parseInt(courseCapacity) || 45,
      term: settings.currentTerm,
      description: courseDescription || 'Core curriculum academic instruction.',
      duration: courseDuration,
      mode: courseLocation === 'Online' ? 'online' : 'in-person'
    });

    if (newCrs && newCrs.id) {
      setCourseCatalogFilter(newCrs.id);
    }

    setCourseCode('');
    setCourseTitle('');
    setCourseClassroom('Room 101');
    setCourseDescription('');
    setCourseTuitionFee('3450');
    setCourseLocation('On-site');
    setIsCreateCourseModalOpen(false);
  };

  const handleStartEditCourse = (crs: Course) => {
    setEditingCourse(crs);
    setEditCourseCode(crs.code);
    setEditCourseTitle(crs.title);
    setEditCourseClassroom(crs.classroom || crs.room || crs.department || '');
    setEditCourseTuitionFee(String(crs.tuitionFee ?? (crs.credits ? crs.credits * (settings.tuitionFeePerCredit || 1150) : 3450)));
    setEditCourseInstructor(crs.instructorName);
    setEditCourseCapacity(String(crs.capacity));
    setEditCourseLocation(crs.location || (crs.mode === 'online' ? 'Online' : 'On-site'));
    setEditCourseDescription(crs.description);
    setEditCourseDuration(crs.duration || '14 Weeks');
  };

  const handleSaveEditCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    editCourse(editingCourse.id, {
      code: editCourseCode.toUpperCase(),
      title: editCourseTitle,
      department: editCourseClassroom || editingCourse.department,
      classroom: editCourseClassroom,
      tuitionFee: parseFloat(editCourseTuitionFee) || 3450,
      instructorName: editCourseInstructor,
      capacity: parseInt(editCourseCapacity) || 45,
      room: editCourseClassroom || (editCourseLocation === 'Online' ? 'Virtual Classroom' : 'Academic Hall 101'),
      location: editCourseLocation,
      description: editCourseDescription,
      duration: editCourseDuration,
      mode: editCourseLocation === 'Online' ? 'online' : 'in-person'
    });

    setEditingCourse(null);
  };

  const handleDeleteCourse = (courseId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete course "${title}"? This will remove all associated enrolled student progress and schedules.`)) {
      deleteCourse(courseId);
    }
  };

  const toggleSelectCourse = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSelectAllCourses = () => {
    if (selectedCourseIds.length === courses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(courses.map(c => c.id));
    }
  };

  const toggleSelectStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const enrolledStudentsList = usersDirectory.filter(u => u.role === 'student');

  const filteredBulkStudents = enrolledStudentsList.filter(s =>
    s.name.toLowerCase().includes(bulkStudentSearch.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(bulkStudentSearch.toLowerCase())) ||
    (s.department && s.department.toLowerCase().includes(bulkStudentSearch.toLowerCase()))
  );

  const handleSelectAllFilteredStudents = () => {
    const allFilteredIds = filteredBulkStudents.map(s => s.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedStudentIds.includes(id));
    if (areAllSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleExecuteBulkEnroll = () => {
    if (selectedCourseIds.length === 0 || selectedStudentIds.length === 0) return;

    bulkEnrollStudentsInCourses(selectedStudentIds, selectedCourseIds);
    setBulkSuccessMessage(
      `Successfully enrolled ${selectedStudentIds.length} student(s) into ${selectedCourseIds.length} selected course(s) in a single operation!`
    );
    setIsBulkEnrollModalOpen(false);
    setSelectedStudentIds([]);
    setTimeout(() => {
      setBulkSuccessMessage(null);
    }, 6000);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      gender: newUserGender,
      department: newUserDepartment,
      avatar: newUserRole === 'admin'
        ? ''
        : newUserGender === 'Female'
        ? 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      studentId: newUserRole === 'student' ? `STU-2026-0${Math.floor(20 + Math.random() * 80)}` : undefined,
      facultyId: newUserRole === 'instructor' ? `FAC-2026-0${Math.floor(10 + Math.random() * 90)}` : undefined,
      status: newUserStatus
    });

    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      institutionName: instName,
      currentTerm: termName,
      registrationOpen: regOpen,
      tuitionFeePerCredit: parseFloat(tuitionRate) || 1150,
      announcementBanner: announcement
    });

    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // Filtered Students for the Dashboard Table
  const filteredDashboardStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      s.department.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesGender =
      studentGenderFilter === 'all' || s.gender === studentGenderFilter;
    const matchesStatus =
      studentStatusFilter === 'all'
        ? true
        : studentStatusFilter === 'active'
        ? s.status === 'active'
        : s.status !== 'active';
    return matchesSearch && matchesGender && matchesStatus;
  });

  const filteredUsers = usersDirectory.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Tab 1: Simple Admin Dashboard */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Institutional Header Banner with LIPA Theme */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f2347] via-[#142c54] to-[#0a1931] text-white p-6 sm:p-7 shadow-sm border border-[#1e3a8a]/40">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start space-x-4">
                <LipaLogo size="xl" variant="badge" className="hidden sm:flex" />
                <div className="space-y-1.5">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                    <Shield className="w-3.5 h-3.5" />
                    <span>LIPA Academic Governance • Executive Dashboard</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
                    Admin Operational Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Overview of student enrollment, active vs. inactive statuses, gender distribution, institutional revenue, and academic faculty.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('performance_analytics')}
                  id="admin-performance-analytics-btn"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center shadow-xs border border-white/15 cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
                  Performance Analytics
                </button>
                <button
                  onClick={() => setActiveTab('financial_record')}
                  id="admin-financial-record-btn"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center shadow-xs border border-white/15 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                  Financial Record
                </button>
                <button
                  onClick={() => setActiveTab('activity_logs')}
                  id="admin-activity-logs-btn"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center shadow-xs border border-white/15 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
                  Activity Logs
                </button>
                <button
                  onClick={() => setActiveTab('enrollment')}
                  id="admin-enroll-btn"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Enroll Student
                </button>
                <button
                  onClick={() => setIsCreateCourseModalOpen(true)}
                  id="admin-create-course-btn"
                  className="px-4 py-2 rounded-xl bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold transition-colors flex items-center shadow-xs border border-blue-400/30 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  Add Course
                </button>
              </div>
            </div>
          </div>

          {/* Core Requested Metrics Grid (8 Core Items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Enrolled Students */}
            <div id="card-total-enrolled-students" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Total Enrolled Students</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {totalEnrolledStudents}
                </p>
                <div className="flex items-center mt-1 text-xs text-slate-500">
                  <span className="inline-flex items-center font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mr-2 text-[11px]">
                    100% Registered
                  </span>
                  <span>Institutional census</span>
                </div>
              </div>
            </div>

            {/* 2. Total Inactive and Active Students */}
            <div id="card-active-inactive-students" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Active &amp; Inactive Students</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">
                    {activeStudents}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Active</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-2xl font-bold text-red-600 font-mono">
                    {inactiveStudents}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Inactive</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {activePercentage}% Active
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                    {inactivePercentage}% Inactive
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Total Instructors */}
            <div id="card-total-instructors" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Total Instructors</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {totalInstructors}
                </p>
                <div className="flex items-center mt-1 text-xs text-slate-500">
                  <span className="inline-flex items-center font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded mr-2 text-[11px]">
                    Faculty Leads
                  </span>
                  <span>Across 4 departments</span>
                </div>
              </div>
            </div>

            {/* 4. Total Amount of Courses */}
            <div id="card-total-courses" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Total Courses</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {totalCourses}
                </p>
                <div className="flex items-center mt-1 text-xs text-slate-500">
                  <span className="inline-flex items-center font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mr-2 text-[11px]">
                    Catalog
                  </span>
                  <span>Active academic offerings</span>
                </div>
              </div>
            </div>

            {/* 5. Total Income */}
            <div id="card-total-income" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Total Income</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-extrabold text-emerald-700 font-mono tracking-tight">
                  ${(totalIncome || 0).toLocaleString()}
                </p>
                <div className="flex items-center mt-1 text-xs text-slate-500">
                  <span className="inline-flex items-center font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mr-2 text-[11px]">
                    Collected
                  </span>
                  <span>Settled tuition &amp; fee receipts</span>
                </div>
              </div>
            </div>

            {/* 6. Pending Payments from Students */}
            <div id="card-pending-payments" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Pending Payments</span>
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-700">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-extrabold text-red-600 font-mono tracking-tight">
                  ${(pendingPayments || 0).toLocaleString()}
                </p>
                <div className="flex items-center mt-1 text-xs text-slate-500">
                  <span className="inline-flex items-center font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded mr-2 text-[11px]">
                    Outstanding
                  </span>
                  <span>Unpaid student balance</span>
                </div>
              </div>
            </div>

            {/* 7. Total Revenue Generated from Student Fees */}
            <div id="card-total-revenue-generated" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Total Revenue Generated</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-extrabold text-blue-900 font-mono tracking-tight">
                  ${totalRevenueGenerated.toLocaleString()}
                </p>
                <div className="flex items-center mt-1 text-xs text-slate-500">
                  <span className="inline-flex items-center font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mr-2 text-[11px]">
                    Gross Fees
                  </span>
                  <span>Income + Pending remittances</span>
                </div>
              </div>
            </div>

            {/* 8. Male vs Female Ratio Summary */}
            <div id="card-gender-ratio-summary" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Gender Ratio</span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                  <PieChartIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-extrabold text-blue-600 font-mono">
                    {maleStudents} M
                  </span>
                  <span className="text-slate-300">/</span>
                  <span className="text-2xl font-extrabold text-teal-600 font-mono">
                    {femaleStudents} F
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800">
                    {malePercentage}% Male
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-800">
                    {femalePercentage}% Female
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts / Graphs for Total Amount of Male and Female Students */}
          <div id="section-gender-charts" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Donut/Pie Chart for Total Amount of Male and Female */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center">
                    <PieChartIcon className="w-4 h-4 mr-2 text-blue-600" />
                    Student Gender Demographics
                  </h2>
                  <p className="text-xs text-slate-500">Proportion of male and female enrolled students</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                  {totalEnrolledStudents} Total
                </span>
              </div>

              {/* Donut Chart */}
              <div className="h-64 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={totalEnrolledStudents > 0 ? genderPieData : [{ name: 'No Enrolled Students', value: 1, color: '#f1f5f9' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={totalEnrolledStudents > 0 ? 4 : 0}
                      dataKey="value"
                    >
                      {(totalEnrolledStudents > 0 ? genderPieData : [{ name: 'No Enrolled Students', value: 1, color: '#f1f5f9' }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                      formatter={(val: number) => [
                        totalEnrolledStudents > 0 ? `${val} students (${Math.round((val / totalEnrolledStudents) * 100)}%)` : '0 students (0%)',
                        'Count'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black font-mono text-slate-900">{totalEnrolledStudents}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled</span>
                </div>
              </div>

              {/* Legend & Stat Pill Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center space-x-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Male Students</span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-lg font-bold font-mono text-blue-900">{maleStudents}</span>
                      <span className="text-xs text-blue-700 font-semibold">({malePercentage}%)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center space-x-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-teal-600 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Female Students</span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-lg font-bold font-mono text-teal-900">{femaleStudents}</span>
                      <span className="text-xs text-teal-700 font-semibold">({femalePercentage}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Comparative Bar Chart for Male and Female Breakdown */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-teal-600" />
                    Male &amp; Female Distribution Analysis
                  </h2>
                  <p className="text-xs text-slate-500">
                    {genderChartView === 'status'
                      ? 'Comparison of active and inactive enrollments across genders'
                      : 'Male and female enrollment counts by academic department'}
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-auto">
                  <button
                    onClick={() => setGenderChartView('status')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      genderChartView === 'status'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    By Activity Status
                  </button>
                  <button
                    onClick={() => setGenderChartView('department')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      genderChartView === 'department'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    By Department
                  </button>
                </div>
              </div>

              {/* Bar Chart Canvas */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {genderChartView === 'status' ? (
                    <BarChart data={genderStatusBarData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="Active" name="Active Students" fill="#10b981" radius={[6, 6, 0, 0]} barSize={38} />
                      <Bar dataKey="Inactive" name="Inactive Students" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={38} />
                    </BarChart>
                  ) : (
                    <BarChart data={genderDeptBarData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                        formatter={(val: number, name: string, item: any) => [`${val} students`, `${name} (${item.payload.fullName})`]}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="Male" name="Male Students" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
                      <Bar dataKey="Female" name="Female Students" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={24} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Subtitle / Key Insights */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="font-medium">
                  {genderChartView === 'status'
                    ? `Active Rate: Male ${Math.round((activeMale / (maleStudents || 1)) * 100)}% • Female ${Math.round((activeFemale / (femaleStudents || 1)) * 100)}%`
                    : `Demographic balance monitored across ${uniqueDepts.length} departments`}
                </span>
                <span className="text-[11px] text-slate-400">Real-time sync with user registry</span>
              </div>
            </div>
          </div>

          {/* Financial Revenue & Student Fees Reconciliation Progress */}
          <div id="section-financial-reconciliation" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-emerald-600" />
                  Student Fees &amp; Revenue Reconciliation
                </h2>
                <p className="text-xs text-slate-500">
                  Comprehensive audit of total income received vs. pending payments from enrolled students
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">Total Billed:</span>
                <span className="text-sm font-bold font-mono text-slate-900 px-3 py-1 bg-slate-100 rounded-xl">
                  ${totalRevenueGenerated.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-700 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Total Income Collected: ${totalIncome.toLocaleString()} ({collectionPercentage}%)
                </span>
                <span className="text-red-700 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Pending Student Payments: ${pendingPayments.toLocaleString()} ({pendingPercentage}%)
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${collectionPercentage}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Collected: $${totalIncome.toLocaleString()}`}
                />
                <div
                  style={{ width: `${pendingPercentage}%` }}
                  className="bg-red-500 h-full transition-all duration-500"
                  title={`Pending: $${pendingPayments.toLocaleString()}`}
                />
              </div>
            </div>

            {/* Fee Category Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Tuition Assessment</span>
                <p className="text-xl font-bold font-mono text-slate-900 mt-1">${Math.round(totalRevenueGenerated * 0.8).toLocaleString()}</p>
                <div className="flex justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                  <span className="text-emerald-700 font-semibold">${Math.round(totalIncome * 0.8).toLocaleString()} Settled</span>
                  <span className="text-red-700 font-semibold">${Math.round(pendingPayments * 0.8).toLocaleString()} Pending</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Lab &amp; Practical Fees</span>
                <p className="text-xl font-bold font-mono text-slate-900 mt-1">${Math.round(totalRevenueGenerated * 0.12).toLocaleString()}</p>
                <div className="flex justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                  <span className="text-emerald-700 font-semibold">${Math.round(totalIncome * 0.12).toLocaleString()} Settled</span>
                  <span className="text-red-700 font-semibold">${Math.round(pendingPayments * 0.12).toLocaleString()} Pending</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Technology &amp; Library Fees</span>
                <p className="text-xl font-bold font-mono text-slate-900 mt-1">${Math.round(totalRevenueGenerated * 0.08).toLocaleString()}</p>
                <div className="flex justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                  <span className="text-emerald-700 font-semibold">${Math.round(totalIncome * 0.08).toLocaleString()} Settled</span>
                  <span className="text-red-700 font-semibold">${Math.round(pendingPayments * 0.08).toLocaleString()} Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Students Quick Directory & Status Management */}
          <div id="section-enrolled-students-directory" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Enrolled Students Directory &amp; Activity Status
                </h2>
                <p className="text-xs text-slate-500">
                  Review student demographics, gender records, and update active/inactive enrollment statuses
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student or ID..."
                    value={userSearchQuery}
                    onChange={e => setUserSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-52"
                  />
                </div>

                {/* Filter by Gender */}
                <select
                  value={studentGenderFilter}
                  onChange={e => setStudentGenderFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
                >
                  <option value="all">All Genders</option>
                  <option value="Male">Male ({maleStudents})</option>
                  <option value="Female">Female ({femaleStudents})</option>
                </select>

                {/* Filter by Status */}
                <select
                  value={studentStatusFilter}
                  onChange={e => setStudentStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only ({activeStudents})</option>
                  <option value="inactive">Inactive Only ({inactiveStudents})</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 font-semibold">Student Name</th>
                    <th className="py-3 font-semibold">Student ID</th>
                    <th className="py-3 font-semibold">Gender</th>
                    <th className="py-3 font-semibold">Department</th>
                    <th className="py-3 font-semibold text-center">Enrollment Status</th>
                    <th className="py-3 font-semibold text-right">Quick Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDashboardStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic text-xs">
                        No enrolled students matching the selected criteria found.
                      </td>
                    </tr>
                  ) : (
                    filteredDashboardStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{student.name}</span>
                              <span className="text-slate-500 text-[11px]">{student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-mono text-slate-700 font-semibold text-[11px]">
                          {student.studentId || 'STU-2026-N/A'}
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            student.gender === 'Female'
                              ? 'bg-teal-50 text-teal-800 border border-teal-200/50'
                              : 'bg-blue-50 text-blue-800 border border-blue-200/50'
                          }`}>
                            {student.gender || 'Not Specified'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 max-w-xs truncate">
                          {student.department}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            student.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : student.status === 'leave'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {student.status === 'active' ? 'Active' : student.status === 'leave' ? 'On Leave' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <select
                            value={student.status}
                            onChange={e => updateUserStatus(student.id, e.target.value as UserProfile['status'])}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none transition-colors"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="leave">On Leave</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Showing {filteredDashboardStudents.length} of {totalEnrolledStudents} enrolled students</span>
              <span className="text-[11px] text-slate-400">Selecting a different status recalculates active/inactive dashboard figures in real-time</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Dedicated Student & Instructor Registration & Enrollment Page */}
      {activeTab === 'enrollment' && (
        <EnrollmentPage onNavigateToCourses={() => setActiveTab('courses_admin')} />
      )}

      {/* Tab: All Students Directory, Profiles, Dossiers, and Export */}
      {activeTab === 'all_students' && (
        <AllStudentsPage
          onNavigateToEnrollment={() => setActiveTab('enrollment')}
          onNavigateToFinances={() => setActiveTab('financial_record')}
        />
      )}

      {/* Tab: All Instructors Directory, Profiles, Edit and Print */}
      {activeTab === 'all_instructors' && (
        <AllInstructorsPage
          onNavigateToEnrollment={() => setActiveTab('enrollment')}
        />
      )}

      {/* Tab 2: Comprehensive Institutional Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">Institutional Reports & Audit Metrics</h2>
              <p className="text-xs text-slate-500">Student demographic cohorts, departmental utilization, and financial ledgers</p>
            </div>

            <button
              onClick={() => alert('Exported Institutional Analytics Report (CSV/Audit format).')}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Comprehensive Audit Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Demographics Donut Chart */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Student Cohort Classification</h3>
              <p className="text-xs text-slate-500">Distribution by academic program degree level</p>

              <div className="h-52 w-full">
                {dynamicDemographics.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-400 italic">No enrolled student cohorts recorded yet</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dynamicDemographics}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {dynamicDemographics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                {dynamicDemographics.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-1">Awaiting student registrations</p>
                ) : (
                  dynamicDemographics.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                        <span className="text-slate-700">{d.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{d.value.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Department Capacity & Completion Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Departmental Academic Performance & Utilization</h3>
              <p className="text-xs text-slate-500">Seat capacity utilization, active classes, and completion rates</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 font-semibold">Department</th>
                      <th className="py-2.5 font-semibold text-center">Students</th>
                      <th className="py-2.5 font-semibold text-center">Courses</th>
                      <th className="py-2.5 font-semibold text-center">Capacity Load</th>
                      <th className="py-2.5 font-semibold text-right">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dynamicDeptMetrics.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                          No departmental records found. Add courses or enroll students to track departmental utilization.
                        </td>
                      </tr>
                    ) : (
                      dynamicDeptMetrics.map(dept => (
                        <tr key={dept.department} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 font-semibold text-slate-900">{dept.department}</td>
                          <td className="py-3 text-center font-mono text-slate-700">{dept.students.toLocaleString()}</td>
                          <td className="py-3 text-center font-mono text-slate-700">{dept.courses}</td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <span className="font-mono font-bold text-slate-800">{dept.capacity}%</span>
                              <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{ width: `${dept.capacity}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-emerald-700">
                            {dept.completion}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">User Management Directory</h2>
              <p className="text-xs text-slate-500">Maintain role-based access control for students, faculty, and administrative staff</p>
            </div>

            <button
              onClick={() => setActiveTab('enrollment')}
              id="directory-add-user-btn"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors shadow-xs font-bold cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5 text-white" />
              Register New Student / Teacher
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, email, department..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto justify-center">
              {(['all', 'student', 'instructor', 'admin'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                    userRoleFilter === role
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role === 'all' ? 'All Roles' : role}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {filteredUsers.length} Accounts Found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 font-semibold">User</th>
                    <th className="py-3 font-semibold">Role</th>
                    <th className="py-3 font-semibold">Gender</th>
                    <th className="py-3 font-semibold">Identifier</th>
                    <th className="py-3 font-semibold">Department</th>
                    <th className="py-3 font-semibold text-center">Status</th>
                    <th className="py-3 font-semibold text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic text-xs">
                        No user accounts matching the criteria found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center space-x-3">
                            {user.role === 'admin' || !user.avatar ? (
                              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-red-500/30">
                                <Shield className="w-4 h-4" />
                              </div>
                            ) : (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                              />
                            )}
                            <div>
                              <span className="font-bold text-slate-900 block">{user.name}</span>
                              <span className="text-slate-500 text-[11px]">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                            user.role === 'student'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'instructor'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            user.gender === 'Female'
                              ? 'bg-teal-50 text-teal-800'
                              : user.gender === 'Male'
                              ? 'bg-blue-50 text-blue-800'
                              : 'text-slate-500'
                          }`}>
                            {user.gender || '—'}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-slate-600 text-[11px]">
                          {user.studentId || user.facultyId || 'ADMIN'}
                        </td>
                        <td className="py-3 text-slate-600 max-w-xs truncate">{user.department}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            user.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : user.status === 'leave'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <select
                            value={user.status}
                            onChange={e => updateUserStatus(user.id, e.target.value as UserProfile['status'])}
                            className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none"
                          >
                            <option value="active">Active</option>
                            <option value="leave">On Leave</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Course Creation & Catalog */}
      {activeTab === 'courses_admin' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {bulkSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bulkSuccessMessage}</span>
              </div>
              <button
                onClick={() => setBulkSuccessMessage(null)}
                className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {materialSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{materialSuccessMsg}</span>
              </div>
              <button
                onClick={() => setMaterialSuccessMsg(null)}
                className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Academic Course Catalog &amp; Curriculum Controls</h2>
              <p className="text-xs text-slate-500">Configure curriculum modules, faculty assignments, school materials, and bulk student enrollments</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Dropdown listing all courses */}
              <div className="flex items-center space-x-2">
                <label htmlFor="course-catalog-filter-dropdown" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Select Course:
                </label>
                <select
                  id="course-catalog-filter-dropdown"
                  value={courseCatalogFilter}
                  onChange={e => setCourseCatalogFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-xs"
                >
                  <option value="all">All Courses ({courses.length})</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMaterialCourseId('ALL');
                  setIsUploadMaterialOpen(true);
                }}
                id="catalog-upload-material-btn"
                className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                Upload School Materials
              </button>

              <button
                onClick={() => setIsBulkEnrollModalOpen(true)}
                disabled={selectedCourseIds.length === 0}
                id="bulk-enroll-courses-btn"
                className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                  selectedCourseIds.length > 0
                    ? 'bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white cursor-pointer ring-2 ring-[#1e3a8a]/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
                title={selectedCourseIds.length === 0 ? "Select at least one course below to bulk enroll students" : "Enroll students into selected courses"}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                <span>Bulk Enroll ({selectedCourseIds.length})</span>
              </button>

              <button
                onClick={() => setIsCreateCourseModalOpen(true)}
                id="catalog-create-course-btn"
                className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors shadow-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5 text-white" />
                Add New Course
              </button>
            </div>
          </div>

          {/* Bulk Selection Sub-Toolbar */}
          {courses.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer select-none font-semibold text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={courses.length > 0 && selectedCourseIds.length === courses.length}
                    onChange={handleSelectAllCourses}
                    className="w-4 h-4 rounded text-[#1e3a8a] focus:ring-[#1e3a8a] border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <span>Select All Courses ({selectedCourseIds.length} of {courses.length} selected)</span>
                </label>

                {selectedCourseIds.length > 0 && (
                  <button
                    onClick={() => setSelectedCourseIds([])}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium ml-2"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <div className="text-xs">
                {selectedCourseIds.length > 0 ? (
                  <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900/60">
                    ✓ {selectedCourseIds.length} course{selectedCourseIds.length > 1 ? 's' : ''} ready for bulk student assignment
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">
                    Use checkboxes to select multiple courses, then click "Bulk Enroll Students"
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Academic Courses Configured</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No course modules exist in the catalog. Click "Add New Course" to provision your first academic curriculum offering.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(courseCatalogFilter === 'all'
                ? courses
                : courses.filter(c => c.id === courseCatalogFilter)
              ).map(crs => {
                const isSelected = selectedCourseIds.includes(crs.id);
                return (
                  <div
                    key={crs.id}
                    className={`rounded-2xl p-5 border shadow-xs transition-all space-y-4 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/20 dark:bg-blue-950/20 border-[#1e3a8a] dark:border-blue-500 ring-2 ring-[#1e3a8a]/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectCourse(crs.id)}
                            className="mt-1 w-4 h-4 rounded text-[#1e3a8a] focus:ring-[#1e3a8a] border-slate-300 dark:border-slate-600 cursor-pointer shrink-0"
                            title="Select course for bulk student enrollment"
                          />
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                {crs.code}
                              </span>
                              <span className="text-xs font-medium text-slate-500">{crs.department}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                crs.mode === 'online'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : crs.mode === 'hybrid'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}>
                                {crs.mode || 'In-Person'}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{crs.title}</h3>
                            <p className="text-xs text-slate-500">Instructor: {crs.instructorName}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Enrolled</span>
                          <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                            {crs.enrolledCount} / {crs.capacity}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {crs.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono flex-wrap">
                        <span>Duration: {crs.duration || '14 Weeks'}</span>
                        <span>•</span>
                        <span>Room: {crs.room}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{crs.credits} Credits</span>
                        <span>•</span>
                        <span className="font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                          Tuition: ${((crs.tuitionFee ?? ((crs.credits || 0) * (settings?.tuitionFeePerCredit || 1150))) || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => openClassroom(crs.id)}
                        className="px-3 py-1.5 bg-[#1e3a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#1e3a8a]/90 flex items-center gap-1 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Enter Classroom</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStartEditCourse(crs)}
                          className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                          title="Edit Course"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(crs.id, crs.title)}
                          className="px-2.5 py-1.5 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Financial Record */}
      {(activeTab === 'financial_record' || activeTab === 'finances_admin' || activeTab === 'financial') && (
        <div className="animate-in fade-in duration-150">
          <AdminFinancialPage onNavigateToEnrollment={() => setActiveTab('enrollment')} />
        </div>
      )}

      {/* Tab: Student Performance Analytics */}
      {(activeTab === 'performance_analytics' || activeTab === 'student_performance' || activeTab === 'performance') && (
        <div className="animate-in fade-in duration-150">
          <StudentPerformanceAnalytics onNavigateToEnrollment={() => setActiveTab('enrollment')} />
        </div>
      )}

      {/* Tab: Instructor Activity Monitor */}
      {(activeTab === 'instructor_monitor' || activeTab === 'instructor_actions') && (
        <div className="animate-in fade-in duration-150">
          <InstructorActivityMonitor />
        </div>
      )}

      {/* Tab: Database & Supabase Schema */}
      {(activeTab === 'supabase_schema' || activeTab === 'database_schema' || activeTab === 'schema') && (
        <div className="animate-in fade-in duration-150">
          <DatabaseSchemaPage />
        </div>
      )}

      {/* Tab: Activity Logs & Audit Trail */}
      {(activeTab === 'activity_logs' || activeTab === 'audit_logs' || activeTab === 'activity') && (
        <div className="animate-in fade-in duration-150">
          <ActivityLogViewer />
        </div>
      )}

      {/* Tab 5: Institutional System Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold font-serif text-slate-900">Institutional System Settings</h2>
            <p className="text-xs text-slate-500">Configure global academic term dates, tuition fee rates, and system banners</p>
          </div>

          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-2xl text-xs">
            {settingsSavedMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Settings successfully updated across university nodes.
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">University / Institute Legal Name</label>
              <input
                type="text"
                value={instName}
                onChange={e => setInstName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Active Academic Term</label>
                <input
                  type="text"
                  value={termName}
                  onChange={e => setTermName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tuition Rate Per Credit Hour ($)</label>
                <input
                  type="number"
                  value={tuitionRate}
                  onChange={e => setTuitionRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regOpen}
                  onChange={e => setRegOpen(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Registration Portal Window Open</span>
                  <span className="text-slate-500">Allows students to add/drop courses through registrar self-service.</span>
                </div>
              </label>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Campus Announcement Broadcast Banner</label>
              <textarea
                rows={3}
                value={announcement}
                onChange={e => setAnnouncement(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Institutional Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Provision New Institutional Account</h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="e.g., Brandon Maxwell"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Academic Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="b.maxwell@lipa.edu.lr"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Primary Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as 'student' | 'instructor')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDepartment}
                    onChange={e => setNewUserDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={newUserGender}
                    onChange={e => setNewUserGender(e.target.value as 'Male' | 'Female')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Account Status</label>
                  <select
                    value={newUserStatus}
                    onChange={e => setNewUserStatus(e.target.value as UserProfile['status'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Course */}
      {isCreateCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Create New Academic Course</h3>
              <button
                onClick={() => setIsCreateCourseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={e => setCourseCode(e.target.value)}
                    placeholder="e.g., PAD-201"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Classroom / Room</label>
                  <input
                    type="text"
                    value={courseClassroom}
                    onChange={e => setCourseClassroom(e.target.value)}
                    placeholder="e.g., Room 101, Executive Lab A"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Course Title</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={e => setCourseTitle(e.target.value)}
                  placeholder="e.g., Public Policy Analysis & Executive Decision Making"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Location</label>
                  <select
                    value={courseLocation}
                    onChange={e => setCourseLocation(e.target.value as 'Online' | 'On-site')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={courseCapacity}
                    onChange={e => setCourseCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Duration</label>
                  <input
                    type="text"
                    value={courseDuration}
                    onChange={e => setCourseDuration(e.target.value)}
                    placeholder="e.g. 14 Weeks"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tuition Fee / Course Amount ($ USD)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['500', '850', '1000', '1200', '1500', '2000', '2500', '3450'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCourseTuitionFee(amt)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        courseTuitionFee === amt
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      ${parseInt(amt).toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={courseTuitionFee}
                  onChange={e => setCourseTuitionFee(e.target.value)}
                  placeholder="Or enter custom tuition amount..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Instructor (Faculty Lead)
                </label>
                <select
                  value={courseInstructor}
                  onChange={e => setCourseInstructor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                >
                  <option value="">-- Select Instructor --</option>
                  {instructors.map(inst => (
                    <option key={inst.id} value={inst.name}>
                      {inst.name} ({inst.title || inst.department || 'Faculty'})
                    </option>
                  ))}
                  {instructors.length === 0 && (
                    <option value="Prof. Arthur Townsend">Prof. Arthur Townsend (Department Head)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Course Description &amp; Syllabus Overview
                </label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={e => setCourseDescription(e.target.value)}
                  placeholder="Provide a clear overview of syllabus objectives, theoretical foundations, weekly modules, deliverables, and expectations..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs"
                  required
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  A clear course description guides students and faculty through core competencies.
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCourseModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  Create &amp; Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Course */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Academic Course: {editingCourse.code}</h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCourse} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Course Code</label>
                  <input
                    type="text"
                    value={editCourseCode}
                    onChange={e => setEditCourseCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Classroom / Room</label>
                  <input
                    type="text"
                    value={editCourseClassroom}
                    onChange={e => setEditCourseClassroom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Course Title</label>
                <input
                  type="text"
                  value={editCourseTitle}
                  onChange={e => setEditCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Location</label>
                  <select
                    value={editCourseLocation}
                    onChange={e => setEditCourseLocation(e.target.value as 'Online' | 'On-site')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={editCourseCapacity}
                    onChange={e => setEditCourseCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Duration</label>
                  <input
                    type="text"
                    value={editCourseDuration}
                    onChange={e => setEditCourseDuration(e.target.value)}
                    placeholder="e.g. 14 Weeks"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tuition Fee / Course Amount ($ USD)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['500', '850', '1000', '1200', '1500', '2000', '2500', '3450'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setEditCourseTuitionFee(amt)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        editCourseTuitionFee === amt
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      ${parseInt(amt).toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={editCourseTuitionFee}
                  onChange={e => setEditCourseTuitionFee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Instructor (Faculty Lead)
                </label>
                <select
                  value={editCourseInstructor}
                  onChange={e => setEditCourseInstructor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                >
                  <option value="">-- Select Instructor --</option>
                  {instructors.map(inst => (
                    <option key={inst.id} value={inst.name}>
                      {inst.name} ({inst.title || inst.department || 'Faculty'})
                    </option>
                  ))}
                  {instructors.length === 0 && (
                    <option value="Prof. Arthur Townsend">Prof. Arthur Townsend (Department Head)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Course Description &amp; Syllabus Overview
                </label>
                <textarea
                  rows={3}
                  value={editCourseDescription}
                  onChange={e => setEditCourseDescription(e.target.value)}
                  placeholder="Overview of syllabus, theoretical foundations, and laboratory expectations..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Enroll Students Modal */}
      {isBulkEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                  <span>Bulk Student Course Enrollment</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Assign multiple students to all selected academic courses in a single batch operation.
                </p>
              </div>
              <button
                onClick={() => setIsBulkEnrollModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Selected Courses Section */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Target Academic Courses ({selectedCourseIds.length})
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  {selectedCourseIds.map(cId => {
                    const crs = courses.find(c => c.id === cId);
                    if (!crs) return null;
                    return (
                      <span
                        key={cId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                      >
                        <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>{crs.code} - {crs.title}</span>
                        <button
                          type="button"
                          onClick={() => toggleSelectCourse(cId)}
                          className="hover:text-rose-600 ml-0.5"
                          title="Remove course from selection"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Student Search & Select All */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select Students ({selectedStudentIds.length} of {filteredBulkStudents.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllFilteredStudents}
                    className="text-xs font-semibold text-[#1e3a8a] dark:text-blue-400 hover:underline"
                  >
                    {filteredBulkStudents.length > 0 && filteredBulkStudents.every(s => selectedStudentIds.includes(s.id))
                      ? 'Deselect All'
                      : 'Select All Filtered'}
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search students by name, student ID, or department..."
                    value={bulkStudentSearch}
                    onChange={e => setBulkStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Students Roster Selection Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {filteredBulkStudents.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 italic">
                    No students found matching your search.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700">
                      <tr className="text-slate-500 dark:text-slate-400">
                        <th className="p-2.5 w-10 text-center">#</th>
                        <th className="p-2.5 font-semibold">Student Name &amp; ID</th>
                        <th className="p-2.5 font-semibold">Department</th>
                        <th className="p-2.5 font-semibold text-center">Current Classes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredBulkStudents.map(st => {
                        const isChecked = selectedStudentIds.includes(st.id);
                        const enrolledCount = st.assignedCourseIds?.length || 0;
                        return (
                          <tr
                            key={st.id}
                            onClick={() => toggleSelectStudent(st.id)}
                            className={`cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-50/70 dark:bg-blue-950/40'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="p-2.5 text-center" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectStudent(st.id)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-900 dark:text-white block">{st.name}</span>
                              <span className="text-slate-500 font-mono text-[11px]">{st.studentId || st.email}</span>
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">
                              {st.department || 'School of Public Administration'}
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {enrolledCount} enrolled
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">{selectedStudentIds.length}</span> students × <span className="font-bold text-slate-900 dark:text-white">{selectedCourseIds.length}</span> courses
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBulkEnrollModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecuteBulkEnroll}
                  disabled={selectedCourseIds.length === 0 || selectedStudentIds.length === 0}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCourseIds.length > 0 && selectedStudentIds.length > 0
                      ? 'bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90 shadow-md cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Enroll {selectedStudentIds.length} Students in {selectedCourseIds.length} Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
