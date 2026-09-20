import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  UserProfile,
  Course,
  StudentCourseProgress,
  ScheduleEvent,
  CourseGradeSummary,
  TuitionStatement,
  PaymentTransaction,
  Lesson,
  Assignment,
  StudentSubmission,
  AttendanceRecord,
  SystemSettings,
  AdminAnalytics,
  LearnType,
  EducationLevel,
  ContractLength,
  CourseMaterial,
  InstructorAction,
  CourseMode,
  AllowedPaymentMethod,
  EmailNotificationItem,
  ActivityLog
} from '../types';
import {
  logActivity,
  subscribeToActivityLogs,
  syncAllDataToFirebase,
  getBackendTableCounts,
  INITIAL_AUDIT_LOGS,
  BackendTableStats,
  BackendSyncSummary
} from '../lib/firebaseService';
import {
  INITIAL_PROFILES,
  INITIAL_COURSES,
  INITIAL_STUDENT_PROGRESS,
  INITIAL_SCHEDULE,
  INITIAL_GRADES_SUMMARY,
  INITIAL_TUITION_STATEMENT,
  INITIAL_TRANSACTIONS,
  INITIAL_LESSONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ATTENDANCE_ROSTER,
  INITIAL_USERS_DIRECTORY,
  INITIAL_ANALYTICS,
  INITIAL_SETTINGS
} from '../data/mockData';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'academic' | 'finance' | 'system' | 'assignment';
  read: boolean;
}

interface LmsContextType {
  currentRole: Role;
  currentUser: UserProfile;
  switchRole: (role: Role) => void;
  switchToSpecificUser: (user: UserProfile) => void;
  submitAssignment: (assignmentId: string, submissionText: string, fileName?: string) => void;
  courses: Course[];
  studentProgress: StudentCourseProgress[];
  scheduleEvents: ScheduleEvent[];
  gradesSummary: CourseGradeSummary[];
  tuitionStatement: TuitionStatement;
  transactions: PaymentTransaction[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: StudentSubmission[];
  attendanceRoster: AttendanceRecord[];
  usersDirectory: UserProfile[];
  analytics: AdminAnalytics;
  settings: SystemSettings;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  // Student financial actions
  makePayment: (amount: number, method: AllowedPaymentMethod, description?: string) => PaymentTransaction;
  activeReceipt: PaymentTransaction | null;
  openReceiptModal: (receipt: PaymentTransaction) => void;
  closeReceiptModal: () => void;
  isPaymentModalOpen: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  // Instructor actions & materials
  createLesson: (lesson: Omit<Lesson, 'id' | 'status'>) => void;
  createAssignment: (assignment: Omit<Assignment, 'id' | 'submissionsCount' | 'averageScore'>) => void;
  sendProject: (project: Omit<Assignment, 'id' | 'submissionsCount' | 'averageScore'>) => void;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;
  updateAttendance: (attendanceId: string, status: AttendanceRecord['status'], notes?: string) => void;
  markAllAttendance: (status: AttendanceRecord['status']) => void;
  addCourseMaterial: (material: Omit<CourseMaterial, 'id' | 'uploadedAt'>) => void;
  deleteCourseMaterial: (materialId: string, courseId: string) => void;
  instructorActions: InstructorAction[];
  addInstructorAction: (action: Omit<InstructorAction, 'id' | 'timestamp'>) => void;

  // Profile customization & credentials
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => void;
  updateStudentProfile: (updates: Partial<UserProfile>) => void;
  setPassword: (newPassword: string) => void;

  // Classroom Navigation
  activeClassroomId: string | null;
  openClassroom: (courseId: string) => void;
  closeClassroom: () => void;

  // Theme
  themeMode: 'light' | 'dark';
  toggleThemeMode: () => void;

  // Admin Course Management
  createCourse: (course: Omit<Course, 'id' | 'enrolledCount' | 'syllabusModules'>) => Course;
  editCourse: (courseId: string, updated: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  assignStudentCourses: (studentId: string, courseIds: string[]) => void;
  bulkEnrollStudentsInCourses: (studentIds: string[], courseIds: string[]) => void;

  // Admin Financial Management
  recordAdminPayment: (data: {
    studentId: string;
    studentName: string;
    studentEmail?: string;
    amount: number;
    category?: 'Tuition' | 'Course Payment' | 'Institutional Fee';
    method: AllowedPaymentMethod;
    description: string;
  }) => PaymentTransaction;
  updateStudentFinancials: (data: {
    studentId: string;
    amountPaid: number;
    balanceOwed: number;
    totalDue?: number;
    paymentMethod: AllowedPaymentMethod;
    description?: string;
    installmentAmount?: number;
  }) => PaymentTransaction;

  // User Administration
  addUser: (user: Omit<UserProfile, 'id' | 'joinedDate'>) => void;
  registerStudent: (data: {
    name: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    address: string;
    phone: string;
    whatsApp: string;
    email: string;
    selectedCourseId: string;
    studentId: string;
    learnType: LearnType;
    department?: string;
    isScholarship?: boolean;
    scholarshipType?: string;
    scholarshipPercentage?: number;
    defaultPassword?: string;
  }) => UserProfile;
  registerInstructor: (data: {
    name: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    phone: string;
    whatsApp: string;
    educationLevel: EducationLevel;
    address: string;
    assignedCourseIds: string[];
    email: string;
    contractLength: ContractLength;
    department?: string;
  }) => UserProfile;
  updateUserStatus: (userId: string, status: UserProfile['status']) => void;
  updateStudentRecord: (studentId: string, updates: Partial<UserProfile>) => void;
  updateInstructorRecord: (instructorId: string, updates: Partial<UserProfile>) => void;
  deleteUser: (userId: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // Email Notifications & Password Flow
  emailNotifications: EmailNotificationItem[];
  unreadEmailCount: number;
  sendEmailNotification: (item: Omit<EmailNotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  markEmailAsRead: (id: string) => void;
  deleteEmail: (id: string) => void;
  activeEmailModal: EmailNotificationItem | null;
  setActiveEmailModal: (email: EmailNotificationItem | null) => void;
  isPasswordSetupModalOpen: boolean;
  setIsPasswordSetupModalOpen: (open: boolean) => void;
  targetPasswordStudentId: string | null;
  setTargetPasswordStudentId: (studentId: string | null) => void;
  setStudentPasswordById: (studentId: string, newPassword: string) => void;
  activateStudentAccount: (studentId: string) => void;

  // Activity Logs & Firebase Backend Integration
  activityLogs: ActivityLog[];
  recordActivity: (data: Omit<ActivityLog, 'id' | 'timestamp'>) => Promise<ActivityLog>;
  syncBackendToFirebase: () => Promise<BackendSyncSummary>;
  isBackendSyncing: boolean;
  lastBackendSync: BackendSyncSummary | null;
  backendTableStats: BackendTableStats[];
  refreshBackendStats: () => Promise<void>;
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role>('student');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_PROFILES.student);
  
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [studentProgress, setStudentProgress] = useState<StudentCourseProgress[]>(INITIAL_STUDENT_PROGRESS);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(INITIAL_SCHEDULE);
  const [gradesSummary, setGradesSummary] = useState<CourseGradeSummary[]>(INITIAL_GRADES_SUMMARY);
  const [tuitionStatement, setTuitionStatement] = useState<TuitionStatement>(INITIAL_TUITION_STATEMENT);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [attendanceRoster, setAttendanceRoster] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_ROSTER);
  const [usersDirectory, setUsersDirectory] = useState<UserProfile[]>(INITIAL_USERS_DIRECTORY);
  const [analytics, setAnalytics] = useState<AdminAnalytics>(INITIAL_ANALYTICS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);

  const [activeReceipt, setActiveReceipt] = useState<PaymentTransaction | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  // Email Notifications State
  const [emailNotifications, setEmailNotifications] = useState<EmailNotificationItem[]>([]);
  const [activeEmailModal, setActiveEmailModal] = useState<EmailNotificationItem | null>(null);
  const [isPasswordSetupModalOpen, setIsPasswordSetupModalOpen] = useState<boolean>(false);
  const [targetPasswordStudentId, setTargetPasswordStudentId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [instructorActions, setInstructorActions] = useState<InstructorAction[]>([]);
  const [activeClassroomId, setActiveClassroomId] = useState<string | null>(null);

  // Firebase Audit Activity Logs & Backend State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_AUDIT_LOGS);
  const [isBackendSyncing, setIsBackendSyncing] = useState<boolean>(false);
  const [lastBackendSync, setLastBackendSync] = useState<BackendSyncSummary | null>(null);
  const [backendTableStats, setBackendTableStats] = useState<BackendTableStats[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToActivityLogs(updatedLogs => {
      setActivityLogs(updatedLogs);
    }, INITIAL_AUDIT_LOGS);

    getBackendTableCounts().then(stats => setBackendTableStats(stats)).catch(() => {});

    return () => {
      unsubscribe();
    };
  }, []);

  const recordActivity = async (data: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> => {
    const entry = await logActivity(data);
    setActivityLogs(prev => [entry, ...prev.filter(l => l.id !== entry.id)]);
    return entry;
  };

  const syncBackendToFirebase = async (): Promise<BackendSyncSummary> => {
    setIsBackendSyncing(true);
    try {
      const summary = await syncAllDataToFirebase({
        users: usersDirectory,
        courses,
        assignments,
        submissions,
        transactions,
        settings,
        activityLogs
      });
      setLastBackendSync(summary);
      const stats = await getBackendTableCounts();
      setBackendTableStats(stats);
      return summary;
    } finally {
      setIsBackendSyncing(false);
    }
  };

  const refreshBackendStats = async () => {
    const stats = await getBackendTableCounts();
    setBackendTableStats(stats);
  };

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lipa_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('lipa_theme', themeMode);
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const openClassroom = (courseId: string) => {
    setActiveClassroomId(courseId);
  };

  const closeClassroom = () => {
    setActiveClassroomId(null);
  };

  const addInstructorAction = (actionData: Omit<InstructorAction, 'id' | 'timestamp'>) => {
    const newAction: InstructorAction = {
      ...actionData,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    };
    setInstructorActions(prev => [newAction, ...prev]);
  };

  const sendEmailNotification = (item: Omit<EmailNotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newEmail: EmailNotificationItem = {
      ...item,
      id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      isRead: false
    };

    setEmailNotifications(prev => [newEmail, ...prev]);

    // Also push a system notification banner
    setNotifications(prev => [
      {
        id: `notif_email_${Date.now()}`,
        title: `📧 Email Sent: ${item.subject}`,
        message: `Dispatched to ${item.recipientName} (${item.recipientEmail})`,
        timestamp: 'Just now',
        read: false,
        type: 'system'
      },
      ...prev
    ]);
  };

  const markEmailAsRead = (id: string) => {
    setEmailNotifications(prev => prev.map(e => e.id === id ? { ...e, isRead: true } : e));
  };

  const deleteEmail = (id: string) => {
    setEmailNotifications(prev => prev.filter(e => e.id !== id));
  };

  const setStudentPasswordById = (studentId: string, newPassword: string) => {
    setUsersDirectory(prev =>
      prev.map(u => (u.id === studentId || u.studentId === studentId || u.email === studentId ? { ...u, passwordSet: true, defaultPassword: newPassword } : u))
    );
    if (currentUser.id === studentId || currentUser.studentId === studentId || currentUser.email === studentId) {
      setCurrentUser(prev => ({ ...prev, passwordSet: true, defaultPassword: newPassword }));
    }
  };

  const activateStudentAccount = (studentId: string) => {
    setUsersDirectory(prev =>
      prev.map(u => (u.id === studentId || u.studentId === studentId ? { ...u, portalActive: true, enrollmentConfirmed: true, status: 'active' } : u))
    );
    if (currentUser.id === studentId || currentUser.studentId === studentId) {
      setCurrentUser(prev => ({ ...prev, portalActive: true, enrollmentConfirmed: true, status: 'active' }));
    }
  };

  const switchRole = (role: Role) => {
    setCurrentRole(role);
    const targetUser = role === 'student' ? INITIAL_PROFILES.student : role === 'instructor' ? INITIAL_PROFILES.instructor : INITIAL_PROFILES.admin;
    if (role === 'student') {
      setCurrentUser(INITIAL_PROFILES.student);
    } else if (role === 'instructor') {
      setCurrentUser(INITIAL_PROFILES.instructor);
    } else {
      setCurrentUser(INITIAL_PROFILES.admin);
    }
    recordActivity({
      action: 'User Authentication / Role Switch',
      category: 'auth',
      actorId: targetUser.id,
      actorName: targetUser.name,
      actorRole: role,
      target: `${role.toUpperCase()} Workspace`,
      details: `Authenticated into system console as ${targetUser.name} (${role.toUpperCase()}).`,
      severity: 'info'
    });
  };

  const switchToSpecificUser = (user: UserProfile) => {
    setCurrentRole(user.role);
    setCurrentUser(user);
    recordActivity({
      action: 'User Login & Perspective Switch',
      category: 'auth',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      target: `${user.role.toUpperCase()} Portal`,
      details: `Active authenticated session assumed by ${user.name} (${user.email}).`,
      severity: 'info'
    });
    setNotifications(prev => [
      {
        id: `notif_sw_${Date.now()}`,
        title: `Switched Perspective to ${user.name}`,
        message: `Now accessing system as ${user.name} (${user.role.toUpperCase()}).`,
        timestamp: 'Just now',
        type: 'system',
        read: false
      },
      ...prev
    ]);
  };

  const submitAssignment = (assignmentId: string, submissionText: string, fileName?: string) => {
    const targetAsg = assignments.find(a => a.id === assignmentId);
    if (!targetAsg) return;

    const existingIndex = submissions.findIndex(
      s => s.assignmentId === assignmentId && s.studentId === currentUser.id
    );

    const subRecord: StudentSubmission = {
      id: existingIndex >= 0 ? submissions[existingIndex].id : `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      assignmentId,
      assignmentTitle: targetAsg.title,
      courseId: targetAsg.courseId,
      courseCode: targetAsg.courseCode,
      studentId: currentUser.id,
      studentName: currentUser.name,
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'pending',
      fileAttachment: fileName || 'deliverable_solution.pdf',
      feedback: submissionText ? `Student Remark: ${submissionText}` : undefined,
      maxScore: targetAsg.totalPoints || 100
    };

    if (existingIndex >= 0) {
      setSubmissions(prev => {
        const next = [...prev];
        next[existingIndex] = subRecord;
        return next;
      });
    } else {
      setSubmissions(prev => [subRecord, ...prev]);
      setAssignments(prev =>
        prev.map(a => (a.id === assignmentId ? { ...a, submissionsCount: (a.submissionsCount || 0) + 1 } : a))
      );
    }

    setNotifications(prev => [
      {
        id: `notif_sub_${Date.now()}`,
        title: 'Deliverable Submitted',
        message: `"${targetAsg.title}" submitted successfully for grading.`,
        timestamp: 'Just now',
        type: 'academic',
        read: false
      },
      ...prev
    ]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [
      {
        ...notif,
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const openReceiptModal = (receipt: PaymentTransaction) => {
    setActiveReceipt(receipt);
  };

  const closeReceiptModal = () => {
    setActiveReceipt(null);
  };

  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const makePayment = (
    amount: number,
    method: AllowedPaymentMethod,
    description = 'Tuition Balance Settlement Payment'
  ): PaymentTransaction => {
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
    const receiptNum = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const refCode = `${method.substring(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}-VERITAS`;

    const newTx: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      receiptNumber: receiptNum,
      date: formattedDate,
      amount,
      category: 'Tuition',
      method,
      status: 'Completed',
      description,
      payerName: currentUser.name,
      studentId: currentUser.studentId || currentUser.id,
      studentEmail: currentUser.email,
      term: settings.currentTerm || 'Fall 2026',
      referenceCode: refCode
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update student's individual balance record
    setUsersDirectory(prev =>
      prev.map(u => {
        if (u.id === currentUser.id || u.studentId === currentUser.studentId) {
          const curPaid = (u.paidAmount || 0) + amount;
          const curTotal = u.totalDue || 0;
          return {
            ...u,
            paidAmount: curPaid,
            balanceOwed: Math.max(0, curTotal - curPaid)
          };
        }
        return u;
      })
    );

    setCurrentUser(prev => {
      const curPaid = (prev.paidAmount || 0) + amount;
      const curTotal = prev.totalDue || 0;
      return {
        ...prev,
        paidAmount: curPaid,
        balanceOwed: Math.max(0, curTotal - curPaid)
      };
    });

    setTuitionStatement(prev => {
      const updatedPaid = (prev.totalPaid || 0) + amount;
      const currentTotalDue = prev.totalDue ?? prev.totalTuition ?? 0;
      const updatedBalance = Math.max(0, (prev.balanceDue ?? currentTotalDue) - amount);
      return {
        ...prev,
        totalDue: currentTotalDue,
        totalTuition: prev.totalTuition || currentTotalDue,
        totalPaid: updatedPaid,
        balanceDue: updatedBalance,
        status: updatedBalance === 0 ? 'paid' : 'partial'
      };
    });

    setAnalytics(prev => ({
      ...prev,
      totalTuitionCollected: prev.totalTuitionCollected + amount,
      totalOutstandingBalance: Math.max(0, prev.totalOutstandingBalance - amount)
    }));

    addNotification({
      title: 'Payment Processed',
      message: `Payment of $${(amount || 0).toLocaleString()} via ${method} processed successfully. Receipt: ${receiptNum}`,
      type: 'finance'
    });

    return newTx;
  };

  const createLesson = (lessonData: Omit<Lesson, 'id' | 'status'>) => {
    const newLesson: Lesson = {
      ...lessonData,
      id: `les_${Date.now()}`,
      status: 'scheduled'
    };
    setLessons(prev => [newLesson, ...prev]);

    // Record action for instructor monitor
    addInstructorAction({
      instructorId: currentUser.id,
      instructorName: currentUser.name,
      courseId: lessonData.courseId,
      courseTitle: lessonData.courseTitle,
      actionType: 'lesson_planned',
      title: `Planned Lecture: ${lessonData.title}`,
      details: `${lessonData.type} scheduled for ${lessonData.date} at ${lessonData.time} in ${lessonData.room}`
    });

    // Also reflect into schedule if matching
    const dayOfWeek = new Date(lessonData.date).toLocaleDateString('en-US', { weekday: 'long' }) as ScheduleEvent['day'];
    if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(dayOfWeek)) {
      const newScheduleEvent: ScheduleEvent = {
        id: `sch_${Date.now()}`,
        courseId: lessonData.courseId,
        courseCode: lessonData.courseCode,
        courseTitle: lessonData.courseTitle,
        instructorName: currentUser.name,
        day: dayOfWeek,
        startTime: lessonData.time,
        endTime: '11:45 AM',
        room: lessonData.room,
        type: lessonData.type === 'Lab Workshop' ? 'Lab' : 'Lecture',
        color: '#1e3a8a'
      };
      setScheduleEvents(prev => [...prev, newScheduleEvent]);
    }
  };

  const createAssignment = (assignmentData: Omit<Assignment, 'id' | 'submissionsCount' | 'averageScore'>) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `asg_${Date.now()}`,
      submissionsCount: 0
    };
    setAssignments(prev => [newAssignment, ...prev]);

    // Record action for instructor monitor
    addInstructorAction({
      instructorId: currentUser.id,
      instructorName: currentUser.name,
      courseId: assignmentData.courseId,
      courseTitle: assignmentData.courseTitle,
      actionType: 'assignment_created',
      title: `Created Assignment: ${assignmentData.title}`,
      details: `Max Points: ${assignmentData.totalPoints}, Due Date: ${assignmentData.dueDate}`
    });
  };

  const sendProject = (projectData: Omit<Assignment, 'id' | 'submissionsCount' | 'averageScore'>) => {
    const newProject: Assignment = {
      ...projectData,
      id: `proj_${Date.now()}`,
      submissionsCount: 0,
      isProject: true
    };
    setAssignments(prev => [newProject, ...prev]);

    addInstructorAction({
      instructorId: currentUser.id,
      instructorName: currentUser.name,
      courseId: projectData.courseId,
      courseTitle: projectData.courseTitle,
      actionType: 'assignment_created',
      title: `Dispatched Project: ${projectData.title}`,
      details: `Class: ${projectData.courseCode} | Max Points: ${projectData.totalPoints} | Due: ${projectData.dueDate}`
    });

    // Notify all students in this course
    const targetStudents = usersDirectory.filter(
      u =>
        u.role === 'student' &&
        ((u.assignedCourseIds && u.assignedCourseIds.includes(projectData.courseId)) ||
          u.selectedCourseId === projectData.courseId)
    );

    targetStudents.forEach(st => {
      sendEmailNotification({
        recipientEmail: st.email,
        recipientName: st.name,
        subject: `New Project Assigned: ${projectData.title} (${projectData.courseCode})`,
        type: 'project_assigned',
        content: `Dear ${st.name},\n\nYour instructor ${currentUser.name} has assigned a comprehensive project for ${projectData.courseCode} - ${projectData.courseTitle}.\n\nProject Title: ${projectData.title}\nDue Date: ${projectData.dueDate}\nTotal Points: ${projectData.totalPoints} Points\nSubmission Type: ${projectData.submissionType || 'Project Deliverables'}\n\nProject Guidelines & Description:\n${projectData.projectBrief || projectData.description}\n\nPlease submit your project files through your student portal before the due date.`,
        actionUrl: '#courses',
        actionText: 'Open Course & Submit Project',
        studentId: st.id
      });
    });

    setNotifications(prev => [
      {
        id: `notif_proj_${Date.now()}`,
        title: `Project Dispatched to Class`,
        message: `"${projectData.title}" dispatched to ${targetStudents.length} enrolled student(s) in ${projectData.courseCode}. Notifications delivered.`,
        timestamp: 'Just now',
        type: 'academic',
        read: false
      },
      ...prev
    ]);
  };

  const gradeSubmission = (submissionId: string, score: number, feedback: string) => {
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            score,
            feedback,
            status: 'graded'
          };
        }
        return sub;
      })
    );

    const subTarget = submissions.find(s => s.id === submissionId);
    if (subTarget) {
      addInstructorAction({
        instructorId: currentUser.id,
        instructorName: currentUser.name,
        courseId: subTarget.courseId || '',
        courseTitle: subTarget.assignmentTitle,
        actionType: 'grade_submitted',
        title: `Assessed Submission: ${subTarget.assignmentTitle}`,
        details: `Awarded score of ${score}/${subTarget.maxScore} to student (${subTarget.studentName})`
      });
    }

    // Update grades in gradesSummary and studentProgress for that student
    if (subTarget) {
      const letterGrade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
      
      setStudentProgress(prev => {
        const hasProgress = prev.some(p => p.courseId === subTarget.courseId);
        if (hasProgress) {
          return prev.map(p =>
            p.courseId === subTarget.courseId
              ? {
                  ...p,
                  currentScore: score,
                  currentGrade: letterGrade,
                  progressPercent: Math.min(100, (p.progressPercent || 20) + 15)
                }
              : p
          );
        } else {
          return [
            ...prev,
            {
              courseId: subTarget.courseId,
              courseCode: subTarget.courseCode || 'CRS',
              courseTitle: subTarget.assignmentTitle,
              instructorName: currentUser.name,
              credits: 3,
              currentGrade: letterGrade,
              currentScore: score,
              progressPercent: 40,
              attendancePercent: 100,
              nextMilestone: 'Next Module Evaluation',
              nextDue: 'Upcoming Session',
              color: '#1e3a8a'
            }
          ];
        }
      });

      const targetAsg = assignments.find(a => a.id === subTarget.assignmentId);
      if (targetAsg) {
        setGradesSummary(prev =>
          prev.map(courseSummary => {
            if (courseSummary.courseId === targetAsg.courseId) {
              const existingItemIndex = courseSummary.items.findIndex(it => it.assignmentName === targetAsg.title);
              const newItem = {
                id: `grade_item_${Date.now()}`,
                courseId: targetAsg.courseId,
                courseCode: targetAsg.courseCode,
                assignmentName: targetAsg.title,
                category: 'Lab Project' as const,
                maxScore: subTarget.maxScore,
                earnedScore: score,
                weight: 20,
                gradedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                feedback
              };
              if (existingItemIndex >= 0) {
                const updatedItems = [...courseSummary.items];
                updatedItems[existingItemIndex] = newItem;
                return { ...courseSummary, items: updatedItems };
              }
              return {
                ...courseSummary,
                items: [...courseSummary.items, newItem]
              };
            }
            return courseSummary;
          })
        );
      }

      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: 'Assignment Graded',
          message: `Submission for "${subTarget.assignmentTitle}" evaluated: ${score}/${subTarget.maxScore} (Grade: ${letterGrade}).`,
          timestamp: 'Just now',
          type: 'academic',
          read: false
        },
        ...prev
      ]);
    }
  };

  const updateAttendance = (attendanceId: string, status: AttendanceRecord['status'], notes?: string) => {
    setAttendanceRoster(prev =>
      prev.map(record => {
        if (record.id === attendanceId) {
          return { ...record, status, notes: notes !== undefined ? notes : record.notes };
        }
        return record;
      })
    );
  };

  const markAllAttendance = (status: AttendanceRecord['status']) => {
    setAttendanceRoster(prev =>
      prev.map(record => ({ ...record, status }))
    );
  };

  // Course Materials (Admin can publish to ALL classes or specific course; Instructors can publish to their classes)
  const addCourseMaterial = (materialData: Omit<CourseMaterial, 'id' | 'uploadedAt'>) => {
    const newMaterial: CourseMaterial = {
      ...materialData,
      id: `mat_${Date.now()}`,
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    if (materialData.courseId === 'ALL') {
      setCourses(prev =>
        prev.map(c => ({
          ...c,
          materials: [...(c.materials || []), { ...newMaterial, courseId: c.id }]
        }))
      );

      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: 'School Material Published to All Classes',
          message: `Official material "${materialData.title}" was distributed across all academic course classrooms.`,
          timestamp: 'Just now',
          type: 'academic',
          read: false
        },
        ...prev
      ]);
    } else {
      setCourses(prev =>
        prev.map(c =>
          c.id === materialData.courseId
            ? { ...c, materials: [...(c.materials || []), newMaterial] }
            : c
        )
      );

      const targetCourse = courses.find(c => c.id === materialData.courseId);

      addInstructorAction({
        instructorId: currentUser.id,
        instructorName: currentUser.name,
        courseId: materialData.courseId,
        courseTitle: targetCourse?.title || '',
        actionType: 'material_uploaded',
        title: `Uploaded ${materialData.type.toUpperCase()}: ${materialData.title}`,
        details: materialData.description || `URL: ${materialData.url}`
      });

      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: 'New Course Material Published',
          message: `"${materialData.title}" was published to ${targetCourse?.code || 'course'}.`,
          timestamp: 'Just now',
          type: 'academic',
          read: false
        },
        ...prev
      ]);
    }
  };

  const deleteCourseMaterial = (materialId: string, courseId: string) => {
    setCourses(prev =>
      prev.map(c =>
        c.id === courseId
          ? { ...c, materials: (c.materials || []).filter(m => m.id !== materialId) }
          : c
      )
    );
  };

  // Course Management: Create, Edit, Delete
  const createCourse = (courseData: Omit<Course, 'id' | 'enrolledCount' | 'syllabusModules'>): Course => {
    const newCourse: Course = {
      ...courseData,
      id: `crs_${Date.now()}`,
      enrolledCount: 0,
      materials: [],
      syllabusModules: []
    };
    setCourses(prev => [newCourse, ...prev]);
    setAnalytics(prev => ({ ...prev, activeCourses: prev.activeCourses + 1 }));

    recordActivity({
      action: 'Course Offering Established',
      category: 'course',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      target: `${newCourse.code} - ${newCourse.title}`,
      details: `Created new course in ${newCourse.department} with ${newCourse.credits} credits and capacity of ${newCourse.capacity} students.`,
      severity: 'info'
    });

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Course Catalog Updated',
        message: `${newCourse.code} - ${newCourse.title} is now established in the academic directory.`,
        timestamp: 'Just now',
        type: 'academic',
        read: false
      },
      ...prev
    ]);

    return newCourse;
  };

  const editCourse = (courseId: string, updated: Partial<Course>) => {
    setCourses(prev =>
      prev.map(c => (c.id === courseId ? { ...c, ...updated } : c))
    );

    if (updated.title || updated.code || updated.instructorName) {
      setStudentProgress(prev =>
        prev.map(sp =>
          sp.courseId === courseId
            ? {
                ...sp,
                courseTitle: updated.title || sp.courseTitle,
                courseCode: updated.code || sp.courseCode,
                instructorName: updated.instructorName || sp.instructorName
              }
            : sp
        )
      );

      setScheduleEvents(prev =>
        prev.map(ev =>
          ev.courseId === courseId
            ? {
                ...ev,
                courseTitle: updated.title || ev.courseTitle,
                courseCode: updated.code || ev.courseCode,
                instructorName: updated.instructorName || ev.instructorName
              }
            : ev
        )
      );

      setLessons(prev =>
        prev.map(les =>
          les.courseId === courseId
            ? {
                ...les,
                courseTitle: updated.title || les.courseTitle,
                courseCode: updated.code || les.courseCode
              }
            : les
        )
      );

      setAssignments(prev =>
        prev.map(asg =>
          asg.courseId === courseId
            ? {
                ...asg,
                courseTitle: updated.title || asg.courseTitle,
                courseCode: updated.code || asg.courseCode
              }
            : asg
        )
      );
    }

    recordActivity({
      action: 'Course Parameters Modified',
      category: 'course',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      target: updated.code || courseId,
      details: `Administrative modifications applied to ${updated.code || courseId}: ${Object.keys(updated).join(', ')}.`,
      severity: 'info'
    });

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Course Modified',
        message: `Administrative modifications applied to ${updated.code || courseId}.`,
        timestamp: 'Just now',
        type: 'academic',
        read: false
      },
      ...prev
    ]);
  };

  const deleteCourse = (courseId: string) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setStudentProgress(prev => prev.filter(sp => sp.courseId !== courseId));
    setScheduleEvents(prev => prev.filter(ev => ev.courseId !== courseId));
    setLessons(prev => prev.filter(les => les.courseId !== courseId));
    setAssignments(prev => prev.filter(asg => asg.courseId !== courseId));

    setUsersDirectory(prev =>
      prev.map(u => ({
        ...u,
        assignedCourseIds: u.assignedCourseIds?.filter(id => id !== courseId)
      }))
    );

    if (currentUser.assignedCourseIds?.includes(courseId)) {
      setCurrentUser(prev => ({
        ...prev,
        assignedCourseIds: prev.assignedCourseIds?.filter(id => id !== courseId)
      }));
    }

    setAnalytics(prev => ({
      ...prev,
      activeCourses: Math.max(0, prev.activeCourses - 1)
    }));

    if (activeClassroomId === courseId) {
      setActiveClassroomId(null);
    }

    recordActivity({
      action: 'Course Offering Terminated',
      category: 'course',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      target: courseToDelete ? `${courseToDelete.code} - ${courseToDelete.title}` : courseId,
      details: `Course removed from institutional academic curriculum directory.`,
      severity: 'warning'
    });

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Course Removed',
        message: `Course ${courseToDelete?.code || courseId} was removed from the academic catalog.`,
        timestamp: 'Just now',
        type: 'academic',
        read: false
      },
      ...prev
    ]);
  };

  // Profile & Password Customization (Admin, Student, Instructor)
  const updateUserProfile = (userId: string, updates: Partial<UserProfile>) => {
    setUsersDirectory(prev =>
      prev.map(u => (u.id === userId || u.studentId === userId || u.facultyId === userId ? { ...u, ...updates } : u))
    );

    if (currentUser.id === userId || currentUser.studentId === userId || currentUser.facultyId === userId) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Profile Updated',
        message: 'Account profile details and academic credentials have been saved.',
        timestamp: 'Just now',
        type: 'system',
        read: false
      },
      ...prev
    ]);
  };

  const updateStudentProfile = (updates: Partial<UserProfile>) => {
    updateUserProfile(currentUser.id, updates);
  };

  const setPassword = (_newPassword: string) => {
    setCurrentUser(prev => ({ ...prev, passwordSet: true }));
    setUsersDirectory(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, passwordSet: true } : u))
    );
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Password Configured',
        message: 'Your secure portal account password has been updated successfully.',
        timestamp: 'Just now',
        type: 'system',
        read: false
      },
      ...prev
    ]);
  };

  // Assign Student to Multiple Courses Simultaneously
  const assignStudentCourses = (studentId: string, courseIds: string[]) => {
    setUsersDirectory(prev =>
      prev.map(u => {
        if (u.id === studentId || u.studentId === studentId) {
          return { ...u, assignedCourseIds: courseIds };
        }
        return u;
      })
    );

    if (currentUser.id === studentId || currentUser.studentId === studentId) {
      setCurrentUser(prev => ({ ...prev, assignedCourseIds: courseIds }));
    }

    // Ensure student progress exists for all assigned courses
    courseIds.forEach(cId => {
      const targetC = courses.find(c => c.id === cId);
      if (targetC) {
        setStudentProgress(prev => {
          if (prev.some(sp => sp.courseId === cId)) return prev;
          return [
            ...prev,
            {
              courseId: targetC.id,
              courseCode: targetC.code,
              courseTitle: targetC.title,
              instructorName: targetC.instructorName,
              credits: targetC.credits,
              currentGrade: 'A',
              currentScore: 94,
              progressPercent: 20,
              attendancePercent: 100,
              nextMilestone: 'Orientation & Syllabus Review',
              nextDue: 'Upcoming Session',
              color: targetC.color || '#1e3a8a'
            }
          ];
        });
      }
    });

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Course Enrollments Assigned',
        message: `Administrator assigned ${courseIds.length} academic courses to student.`,
        timestamp: 'Just now',
        type: 'academic',
        read: false
      },
      ...prev
    ]);
  };

  // Bulk Enroll Multiple Students into Multiple Courses in One Operation
  const bulkEnrollStudentsInCourses = (studentIds: string[], courseIds: string[]) => {
    if (studentIds.length === 0 || courseIds.length === 0) return;

    // Update students in usersDirectory
    setUsersDirectory(prev =>
      prev.map(u => {
        if (studentIds.includes(u.id) || (u.studentId && studentIds.includes(u.studentId))) {
          const existingCourses = u.assignedCourseIds || [];
          const updatedCourses = Array.from(new Set([...existingCourses, ...courseIds]));
          const matchedTitles = courses.filter(c => updatedCourses.includes(c.id)).map(c => c.title);
          return {
            ...u,
            assignedCourseIds: updatedCourses,
            selectedCourseName: matchedTitles.join(', ')
          };
        }
        return u;
      })
    );

    // Update currentUser if active student is among selected
    if (studentIds.includes(currentUser.id) || (currentUser.studentId && studentIds.includes(currentUser.studentId))) {
      setCurrentUser(prev => {
        const existingCourses = prev.assignedCourseIds || [];
        const updatedCourses = Array.from(new Set([...existingCourses, ...courseIds]));
        return { ...prev, assignedCourseIds: updatedCourses };
      });
    }

    // Update enrolledCount on selected courses
    setCourses(prev =>
      prev.map(c => {
        if (!courseIds.includes(c.id)) return c;
        const newlyEnrolledCount = studentIds.filter(stId => {
          const st = usersDirectory.find(u => u.id === stId || u.studentId === stId);
          return st && !st.assignedCourseIds?.includes(c.id);
        }).length;
        return {
          ...c,
          enrolledCount: (c.enrolledCount || 0) + newlyEnrolledCount
        };
      })
    );

    // Generate progress records for newly enrolled courses
    courseIds.forEach(cId => {
      const targetC = courses.find(c => c.id === cId);
      if (targetC) {
        setStudentProgress(prev => {
          if (prev.some(sp => sp.courseId === cId)) return prev;
          return [
            ...prev,
            {
              courseId: targetC.id,
              courseCode: targetC.code,
              courseTitle: targetC.title,
              instructorName: targetC.instructorName,
              credits: targetC.credits,
              currentGrade: 'In Progress',
              currentScore: 0,
              progressPercent: 0,
              attendancePercent: 100,
              nextMilestone: 'Curriculum Commenced',
              nextDue: 'Upcoming Session',
              color: targetC.color || '#1e3a8a'
            }
          ];
        });
      }
    });

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Bulk Course Enrollment Complete',
        message: `Admin successfully enrolled ${studentIds.length} student(s) into ${courseIds.length} course(s) in a single operation.`,
        timestamp: 'Just now',
        type: 'academic',
        read: false
      },
      ...prev
    ]);
  };

  // Financial & Bursar Management
  const recordAdminPayment = (data: {
    studentId: string;
    studentName: string;
    studentEmail?: string;
    amount: number;
    category?: 'Tuition' | 'Course Payment' | 'Institutional Fee';
    method: AllowedPaymentMethod;
    description: string;
  }): PaymentTransaction => {
    const receiptNum = `RCP-LIPA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const refCode = `BUR-${Date.now().toString().slice(-6)}`;

    const newTx: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      receiptNumber: receiptNum,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      amount: data.amount,
      category: data.category || 'Tuition',
      method: data.method,
      status: 'Completed',
      description: data.description || `Official Course Payment via Bursar Window`,
      payerName: data.studentName,
      studentId: data.studentId,
      studentEmail: data.studentEmail || 'student@lipa.edu.lr',
      term: settings.currentTerm || 'Fall 2026',
      referenceCode: refCode
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update target student's individual ledger in usersDirectory
    setUsersDirectory(prev =>
      prev.map(u => {
        if (u.id === data.studentId || u.studentId === data.studentId) {
          const curPaid = (u.paidAmount || 0) + data.amount;
          const curTotalDue = u.totalDue || 0;
          return {
            ...u,
            paidAmount: curPaid,
            balanceOwed: Math.max(0, curTotalDue - curPaid)
          };
        }
        return u;
      })
    );

    if (currentUser.id === data.studentId || currentUser.studentId === data.studentId) {
      setCurrentUser(prev => {
        const curPaid = (prev.paidAmount || 0) + data.amount;
        const curTotalDue = prev.totalDue || 0;
        return {
          ...prev,
          paidAmount: curPaid,
          balanceOwed: Math.max(0, curTotalDue - curPaid)
        };
      });
    }

    setTuitionStatement(prev => {
      const newTotalPaid = (prev.totalPaid || 0) + data.amount;
      const currentTotalDue = prev.totalDue ?? prev.totalTuition ?? 0;
      const newBalanceDue = Math.max(0, (prev.balanceDue ?? currentTotalDue) - data.amount);

      return {
        ...prev,
        totalDue: currentTotalDue,
        totalTuition: prev.totalTuition || currentTotalDue,
        totalPaid: newTotalPaid,
        balanceDue: newBalanceDue,
        status: newBalanceDue === 0 ? 'paid' : 'partial'
      };
    });

    setAnalytics(prev => ({
      ...prev,
      totalTuitionCollected: prev.totalTuitionCollected + data.amount,
      totalOutstandingBalance: Math.max(0, prev.totalOutstandingBalance - data.amount)
    }));

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Bursar Receipt Generated',
        message: `Official Receipt ${receiptNum} recorded for ${data.studentName} ($${(data.amount || 0).toLocaleString()}) via ${data.method}.`,
        timestamp: 'Just now',
        type: 'finance',
        read: false
      },
      ...prev
    ]);

    return newTx;
  };

  const updateStudentFinancials = (data: {
    studentId: string;
    amountPaid: number;
    balanceOwed: number;
    totalDue?: number;
    paymentMethod: AllowedPaymentMethod;
    description?: string;
    installmentAmount?: number;
  }): PaymentTransaction => {
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
    const receiptNum = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const methodClean = (data.paymentMethod || 'CASH').replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const refCode = `${methodClean}-${Math.floor(100000 + Math.random() * 900000)}-LIPA`;

    let targetStudentName = 'Student';
    let targetStudentEmail = 'student@lipa.edu.lr';

    setUsersDirectory(prev =>
      prev.map(u => {
        if (u.id === data.studentId || u.studentId === data.studentId) {
          targetStudentName = u.name;
          targetStudentEmail = u.email;
          const assessedTotal = data.totalDue !== undefined && data.totalDue > 0
            ? data.totalDue
            : (u.totalDue !== undefined && u.totalDue > 0 ? u.totalDue : (data.amountPaid + data.balanceOwed));
          const isFullyCleared = data.balanceOwed <= 0;
          const isPartial = data.amountPaid > 0 && data.balanceOwed > 0;

          return {
            ...u,
            totalDue: assessedTotal,
            paidAmount: data.amountPaid,
            balanceOwed: data.balanceOwed,
            financialStatus: isFullyCleared ? 'cleared' : isPartial ? 'partial' : 'pending',
            enrollmentConfirmed: true,
            portalActive: true,
            status: 'active' as const,
            paymentMethod: data.paymentMethod,
            lastPaymentDate: formattedDate
          };
        }
        return u;
      })
    );

    if (currentUser.id === data.studentId || currentUser.studentId === data.studentId) {
      setCurrentUser(prev => {
        const assessedTotal = data.totalDue !== undefined && data.totalDue > 0
          ? data.totalDue
          : (prev.totalDue !== undefined && prev.totalDue > 0 ? prev.totalDue : (data.amountPaid + data.balanceOwed));
        const isFullyCleared = data.balanceOwed <= 0;
        const isPartial = data.amountPaid > 0 && data.balanceOwed > 0;

        return {
          ...prev,
          totalDue: assessedTotal,
          paidAmount: data.amountPaid,
          balanceOwed: data.balanceOwed,
          financialStatus: isFullyCleared ? 'cleared' : isPartial ? 'partial' : 'pending',
          enrollmentConfirmed: true,
          portalActive: true,
          status: 'active' as const,
          paymentMethod: data.paymentMethod,
          lastPaymentDate: formattedDate
        };
      });
    }

    const txAmount = data.installmentAmount !== undefined && data.installmentAmount > 0
      ? data.installmentAmount
      : data.amountPaid;

    const newTx: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      receiptNumber: receiptNum,
      date: formattedDate,
      amount: txAmount,
      category: 'Tuition',
      method: data.paymentMethod,
      status: 'Completed',
      description: data.description || `Course Payment via ${data.paymentMethod} - Portal Activated`,
      payerName: targetStudentName,
      studentId: data.studentId,
      studentEmail: targetStudentEmail,
      term: settings.currentTerm || 'Fall 2026',
      referenceCode: refCode
    };

    setTransactions(prev => [newTx, ...prev]);

    // Recalculate dynamic analytics
    setAnalytics(prev => ({
      ...prev,
      totalTuitionCollected: prev.totalTuitionCollected + (txAmount > 0 ? txAmount : 0)
    }));

    // Automatic email notification confirming payment and account activation
    sendEmailNotification({
      recipientEmail: targetStudentEmail,
      recipientName: targetStudentName,
      subject: data.balanceOwed <= 0
        ? 'Account Activated - Official Enrollment Cleared'
        : 'Payment Confirmed - Financial Record Updated & Account Active',
      type: 'payment_activated',
      content: `Dear ${targetStudentName},\n\nYour tuition payment of $${(txAmount || 0).toLocaleString()} has been confirmed by the LIPA Bursar.\n\nReceipt Number: ${receiptNum}\nPayment Method: ${data.paymentMethod}\nReference Code: ${refCode}\nTotal Paid to Date: $${(data.amountPaid || 0).toLocaleString()}\nRemaining Balance: $${(data.balanceOwed || 0).toLocaleString()}\n\nYour student account and portal are fully ACTIVATED! You may access your dashboard, registered courses, and academic materials.`,
      actionUrl: '#dashboard',
      actionText: 'Access Course Materials & Dashboard',
      studentId: data.studentId
    });

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Enrollment Confirmed & Portal Activated',
        message: `Payment of $${(txAmount || 0).toLocaleString()} processed for ${targetStudentName} via ${data.paymentMethod}. Remaining balance: $${(data.balanceOwed || 0).toLocaleString()}. Portal active!`,
        timestamp: 'Just now',
        type: 'finance',
        read: false
      },
      ...prev
    ]);

    return newTx;
  };

  const addUser = (userData: Omit<UserProfile, 'id' | 'joinedDate'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: `usr_${Date.now()}`,
      joinedDate: 'Fall 2026',
      avatar: userData.avatar || '',
      coverPhoto: userData.coverPhoto || ''
    };
    setUsersDirectory(prev => [newUser, ...prev]);
    if (userData.role === 'student') {
      setAnalytics(prev => ({ ...prev, totalStudents: prev.totalStudents + 1 }));
    } else if (userData.role === 'instructor') {
      setAnalytics(prev => ({ ...prev, totalInstructors: prev.totalInstructors + 1 }));
    }
  };

  const registerStudent = (data: {
    name: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    address: string;
    phone: string;
    whatsApp: string;
    email: string;
    selectedCourseId: string;
    studentId: string;
    learnType: LearnType;
    department?: string;
    isScholarship?: boolean;
    scholarshipType?: string;
    scholarshipPercentage?: number;
    defaultPassword?: string;
  }): UserProfile => {
    // Single course registration mandate
    const targetCourse = courses.find(c => c.id === data.selectedCourseId) || courses[0];
    const feePerCredit = settings.tuitionFeePerCredit || 1150;
    const courseTuition = targetCourse?.tuitionFee !== undefined && targetCourse.tuitionFee > 0
      ? targetCourse.tuitionFee
      : (targetCourse ? targetCourse.credits * feePerCredit : 0);

    const isSchol = !!data.isScholarship;
    const scholPercent = isSchol ? (data.scholarshipPercentage !== undefined ? data.scholarshipPercentage : 100) : 0;
    const tuitionDiscount = isSchol ? (courseTuition * scholPercent) / 100 : 0;
    const studentTotalDue = Math.max(0, courseTuition - tuitionDiscount);

    const isFullScholarship = isSchol && scholPercent >= 100;
    const initialPaidAmount = 0;
    const initialBalanceOwed = studentTotalDue;
    const initialConfirmed = isFullScholarship; // Full scholarship students are cleared immediately
    const initialPortalActive = isFullScholarship;

    if (targetCourse) {
      // Increment course enrolled count
      setCourses(prev =>
        prev.map(c =>
          c.id === targetCourse.id ? { ...c, enrolledCount: (c.enrolledCount || 0) + 1 } : c
        )
      );

      // Add to student progress for the single course
      const newProgress: StudentCourseProgress = {
        courseId: targetCourse.id,
        courseCode: targetCourse.code,
        courseTitle: targetCourse.title,
        instructorName: targetCourse.instructorName,
        credits: targetCourse.credits,
        currentGrade: 'A',
        currentScore: 95,
        progressPercent: 15,
        attendancePercent: 100,
        nextMilestone: 'Orientation & Syllabus Review',
        nextDue: 'Upcoming Session',
        color: targetCourse.color || '#1e3a8a'
      };
      setStudentProgress(prev => {
        if (prev.some(p => p.courseId === targetCourse.id)) return prev;
        return [...prev, newProgress];
      });

      // Add to schedule events
      const newScheduleEvent: ScheduleEvent = {
        id: `sch_${Date.now()}_${targetCourse.id}`,
        courseId: targetCourse.id,
        courseCode: targetCourse.code,
        courseTitle: targetCourse.title,
        day: 'Monday',
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        room: targetCourse.room || (data.learnType === 'Online' ? 'Virtual Classroom' : 'Academic Hall 101'),
        instructorName: targetCourse.instructorName,
        type: data.learnType === 'Online' ? 'Lecture' : 'Seminar',
        color: targetCourse.color || '#1e3a8a'
      };
      setScheduleEvents(prev => [...prev, newScheduleEvent]);

      // Add tuition billing line item for the registered course
      const newLineItem = {
        id: `line_${Date.now()}_${targetCourse.id}`,
        courseCode: targetCourse.code,
        description: `${targetCourse.title} (${data.learnType})${isSchol ? ` [${data.scholarshipType || 'Scholarship Award'}]` : ''} - Registered Course`,
        credits: targetCourse.credits,
        feePerCredit: targetCourse.tuitionFee ? Math.round(targetCourse.tuitionFee / targetCourse.credits) : feePerCredit,
        totalAmount: studentTotalDue,
        status: isFullScholarship ? ('paid' as const) : ('unpaid' as const),
        category: 'tuition' as const
      };

      setTuitionStatement(prev => {
        const newTotalTuition = (prev.totalTuition || 0) + studentTotalDue;
        const newTotalDue = (prev.totalDue ?? prev.totalTuition ?? 0) + studentTotalDue;
        const newBalance = (prev.balanceDue || 0) + studentTotalDue;
        return {
          ...prev,
          totalTuition: newTotalTuition,
          totalDue: newTotalDue,
          balanceDue: newBalance,
          lineItems: [...(prev.lineItems || []), newLineItem]
        };
      });
    }

    const studentIdFormatted = data.studentId.trim() || `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedPassword = data.defaultPassword || `Lipa#2026!${Math.floor(100 + Math.random() * 900)}`;

    const newStudent: UserProfile = {
      id: `stu_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'student',
      gender: data.gender,
      avatar: '',
      coverPhoto: '',
      department: data.department || targetCourse?.department || 'Administration & Management',
      studentId: studentIdFormatted,
      academicYear: 'First Year',
      major: targetCourse?.title || 'Public Administration',
      phone: data.phone,
      whatsApp: data.whatsApp,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      learnType: data.learnType,
      selectedCourseId: targetCourse?.id || '',
      selectedCourseName: targetCourse?.title || '',
      assignedCourseIds: targetCourse ? [targetCourse.id] : [],
      joinedDate: settings.currentTerm || 'Fall 2026',
      status: 'active',
      passwordSet: false,
      defaultPassword: generatedPassword,
      totalDue: studentTotalDue,
      paidAmount: initialPaidAmount,
      balanceOwed: initialBalanceOwed,
      isScholarship: isSchol,
      scholarshipType: isSchol ? (data.scholarshipType || 'Full Institutional Scholarship') : undefined,
      scholarshipPercentage: isSchol ? scholPercent : undefined,
      enrollmentConfirmed: initialConfirmed,
      portalActive: initialPortalActive,
      financialStatus: isFullScholarship ? 'cleared' : 'pending'
    };

    setUsersDirectory(prev => [newStudent, ...prev]);
    setAnalytics(prev => ({
      ...prev,
      totalStudents: prev.totalStudents + 1,
      totalTuitionBilled: prev.totalTuitionBilled + studentTotalDue,
      totalOutstandingBalance: prev.totalOutstandingBalance + initialBalanceOwed
    }));

    // Send automatic registration email with default password & password setup link
    sendEmailNotification({
      recipientEmail: data.email,
      recipientName: data.name,
      subject: 'Welcome to LIPA - Account Created & Password Setup',
      type: 'registration_password_setup',
      content: `Dear ${data.name},\n\nYour student account at LIPA eLearning Center has been officially created.\n\nStudent ID: ${studentIdFormatted}\nRegistered Course: ${targetCourse?.code || 'CRS-101'} - ${targetCourse?.title || 'Academic Course'}\nAuto-Generated Default Password: ${generatedPassword}\n\nPlease click the button below to change your password. Once your permanent password is set, you can log in and access your student dashboard, syllabus, and course materials.`,
      actionUrl: `#password-setup-${newStudent.id}`,
      actionText: 'Set Permanent Password',
      studentId: newStudent.id,
      tempPassword: generatedPassword
    });

    if (isFullScholarship) {
      sendEmailNotification({
        recipientEmail: data.email,
        recipientName: data.name,
        subject: 'Account Activated - 100% Institutional Scholarship Confirmed',
        type: 'payment_activated',
        content: `Dear ${data.name},\n\nCongratulations! Your 100% Institutional Scholarship has been approved. Your account is fully active and cleared for the term. You may now access your course materials and dashboard.`,
        actionUrl: `#dashboard`,
        actionText: 'Access Course Materials & Dashboard',
        studentId: newStudent.id
      });
    }

    setNotifications(prev => [
      {
        id: `notif_pwd_${Date.now()}`,
        title: 'Account Password Setup Required',
        message: `Welcome ${data.name}! Your student registration is complete. Please set your account password to access all online classroom services.`,
        timestamp: 'Just now',
        read: false,
        type: 'system'
      },
      {
        id: `notif_${Date.now()}`,
        title: 'Student Registered & Course Assigned',
        message: `${data.name} (${studentIdFormatted}) enrolled into ${targetCourse?.code || 'course'} - ${targetCourse?.title || ''}. Tuition: $${(studentTotalDue || 0).toLocaleString()}.`,
        timestamp: 'Just now',
        read: false,
        type: 'academic'
      },
      ...prev
    ]);

    return newStudent;
  };

  const registerInstructor = (data: {
    name: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    phone: string;
    whatsApp: string;
    educationLevel: EducationLevel;
    address: string;
    assignedCourseIds: string[];
    email: string;
    contractLength: ContractLength;
    department?: string;
  }): UserProfile => {
    const newInstructorId = `inst_${Date.now()}`;
    const facultyIdFormatted = `FAC-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Update assigned courses to associate this instructor
    if (data.assignedCourseIds && data.assignedCourseIds.length > 0) {
      setCourses(prev =>
        prev.map(c =>
          data.assignedCourseIds.includes(c.id)
            ? { ...c, instructorId: newInstructorId, instructorName: data.name }
            : c
        )
      );
    }

    const newInstructor: UserProfile = {
      id: newInstructorId,
      name: data.name,
      email: data.email,
      role: 'instructor',
      gender: data.gender,
      avatar: '',
      department: data.department || 'Institute Faculty Council',
      facultyId: facultyIdFormatted,
      title: `${data.educationLevel === 'PHD' ? 'Dr.' : data.educationLevel === 'Master' ? 'Prof.' : 'Lecturer'} Faculty Instructor`,
      phone: data.phone,
      whatsApp: data.whatsApp,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      educationLevel: data.educationLevel,
      contractLength: data.contractLength,
      assignedCourseIds: data.assignedCourseIds,
      joinedDate: settings.currentTerm || 'Fall 2026',
      status: 'active'
    };

    setUsersDirectory(prev => [newInstructor, ...prev]);
    setAnalytics(prev => ({
      ...prev,
      totalInstructors: prev.totalInstructors + 1
    }));

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'New Faculty Appointed',
        message: `${data.name} (${data.educationLevel}, ${data.contractLength}) appointed with ${data.assignedCourseIds.length} course(s) assigned.`,
        timestamp: 'Just now',
        read: false,
        type: 'academic'
      },
      ...prev
    ]);

    return newInstructor;
  };

  const updateUserStatus = (userId: string, status: UserProfile['status']) => {
    setUsersDirectory(prev =>
      prev.map(user => (user.id === userId ? { ...user, status } : user))
    );
  };

  const updateStudentRecord = (studentId: string, updates: Partial<UserProfile>) => {
    setUsersDirectory(prev =>
      prev.map(u => {
        if (u.id === studentId || u.studentId === studentId) {
          const updated = { ...u, ...updates };
          // If assigned courses changed, recalculate totalDue and balanceOwed
          if (updates.assignedCourseIds) {
            const assigned = courses.filter(c => updates.assignedCourseIds?.includes(c.id));
            const newTuition = assigned.reduce((acc, c) => {
              return acc + (c.tuitionFee !== undefined && c.tuitionFee > 0 ? c.tuitionFee : c.credits * (settings.tuitionFeePerCredit || 1150));
            }, 0);
            updated.totalDue = newTuition;
            updated.balanceOwed = Math.max(0, newTuition - (updated.paidAmount || 0));
          } else if (updates.totalDue !== undefined) {
            updated.balanceOwed = Math.max(0, updates.totalDue - (updated.paidAmount || 0));
          }
          return updated;
        }
        return u;
      })
    );

    if (currentUser.id === studentId || currentUser.studentId === studentId) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Student Record Updated',
        message: `Administrative modifications saved for student record.`,
        timestamp: 'Just now',
        type: 'system',
        read: false
      },
      ...prev
    ]);
  };

  const updateInstructorRecord = (instructorId: string, updates: Partial<UserProfile>) => {
    setUsersDirectory(prev =>
      prev.map(u => (u.id === instructorId || u.facultyId === instructorId ? { ...u, ...updates } : u))
    );

    if (currentUser.id === instructorId || currentUser.facultyId === instructorId) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Faculty Dossier Updated',
        message: `Administrative modifications saved for faculty instructor.`,
        timestamp: 'Just now',
        type: 'system',
        read: false
      },
      ...prev
    ]);
  };

  const deleteUser = (userId: string) => {
    setUsersDirectory(prev => prev.filter(u => u.id !== userId && u.studentId !== userId && u.facultyId !== userId));
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Record Removed',
        message: `User record removed from institution directory.`,
        timestamp: 'Just now',
        type: 'system',
        read: false
      },
      ...prev
    ]);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    recordActivity({
      action: 'System Configuration Updated',
      category: 'system',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      target: 'System Settings',
      details: `Institutional parameters updated: ${Object.keys(newSettings).join(', ')}.`,
      severity: 'warning'
    });
  };

  return (
    <LmsContext.Provider
      value={{
        currentRole,
        currentUser,
        switchRole,
        switchToSpecificUser,
        submitAssignment,
        courses,
        studentProgress,
        scheduleEvents,
        gradesSummary,
        tuitionStatement,
        transactions,
        lessons,
        assignments,
        submissions,
        attendanceRoster,
        usersDirectory,
        analytics,
        settings,
        notifications,
        unreadNotificationCount: notifications.filter(n => !n.read).length,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        makePayment,
        activeReceipt,
        openReceiptModal,
        closeReceiptModal,
        isPaymentModalOpen,
        openPaymentModal,
        closePaymentModal,
        createLesson,
        createAssignment,
        sendProject,
        gradeSubmission,
        updateAttendance,
        markAllAttendance,
        createCourse,
        editCourse,
        deleteCourse,
        assignStudentCourses,
        bulkEnrollStudentsInCourses,
        addCourseMaterial,
        deleteCourseMaterial,
        instructorActions,
        addInstructorAction,
        updateUserProfile,
        updateStudentProfile,
        setPassword,
        activeClassroomId,
        openClassroom,
        closeClassroom,
        themeMode,
        toggleThemeMode,
        recordAdminPayment,
        updateStudentFinancials,
        addUser,
        registerStudent,
        registerInstructor,
        updateUserStatus,
        updateStudentRecord,
        updateInstructorRecord,
        deleteUser,
        updateSettings,
        emailNotifications,
        unreadEmailCount: emailNotifications.filter(e => !e.isRead).length,
        sendEmailNotification,
        markEmailAsRead,
        deleteEmail,
        activeEmailModal,
        setActiveEmailModal,
        isPasswordSetupModalOpen,
        setIsPasswordSetupModalOpen,
        targetPasswordStudentId,
        setTargetPasswordStudentId,
        setStudentPasswordById,
        activateStudentAccount,
        activityLogs,
        recordActivity,
        syncBackendToFirebase,
        isBackendSyncing,
        lastBackendSync,
        backendTableStats,
        refreshBackendStats
      }}
    >
      {children}
    </LmsContext.Provider>
  );
};

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};
