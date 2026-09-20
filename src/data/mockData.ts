import {
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
  AdminAnalytics
} from '../types';

export const INITIAL_PROFILES: Record<string, UserProfile> = {
  student: {
    id: 'usr_student_active',
    name: 'Student User',
    email: 'student@lipa.edu.lr',
    role: 'student',
    gender: 'Male',
    avatar: '',
    coverPhoto: '',
    department: 'General Studies',
    studentId: 'STU-001',
    academicYear: 'First Year',
    major: 'General Academic Studies',
    phone: '',
    assignedCourseIds: [],
    joinedDate: 'Fall 2026',
    status: 'active',
    passwordSet: true
  },
  instructor: {
    id: 'usr_instructor_active',
    name: 'Faculty Instructor',
    email: 'instructor@lipa.edu.lr',
    role: 'instructor',
    gender: 'Male',
    avatar: '',
    department: 'Academic Faculty',
    facultyId: 'FAC-001',
    title: 'Senior Faculty Lecturer',
    phone: '',
    assignedCourseIds: [],
    joinedDate: 'Fall 2026',
    status: 'active'
  },
  admin: {
    id: 'usr_admin_active',
    name: 'System Administrator',
    email: 'admin@lipa.edu.lr',
    role: 'admin',
    gender: 'Female',
    avatar: '',
    department: 'Institutional Administration',
    title: 'Academic Systems Administrator',
    phone: '',
    joinedDate: 'Fall 2026',
    status: 'active'
  }
};

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_STUDENT_PROGRESS: StudentCourseProgress[] = [];

export const INITIAL_SCHEDULE: ScheduleEvent[] = [];

export const INITIAL_GRADES_SUMMARY: CourseGradeSummary[] = [];

export const INITIAL_TUITION_STATEMENT: TuitionStatement = {
  semester: 'Fall Semester 2026',
  academicYear: '2026 - 2027',
  totalTuition: 0,
  totalDue: 0,
  labFees: 0,
  technologyFee: 0,
  studentServicesFee: 0,
  scholarshipGrant: 0,
  totalPaid: 0,
  balanceDue: 0,
  dueDate: 'TBD',
  status: 'paid',
  lineItems: []
};

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [];

export const INITIAL_LESSONS: Lesson[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = [];

export const INITIAL_SUBMISSIONS: StudentSubmission[] = [];

export const INITIAL_ATTENDANCE_ROSTER: AttendanceRecord[] = [];

export const INITIAL_USERS_DIRECTORY: UserProfile[] = [];

export const INITIAL_ANALYTICS: AdminAnalytics = {
  totalStudents: 0,
  totalInstructors: 0,
  activeCourses: 0,
  newApplicationsThisTerm: 0,
  overallCompletionRate: 0,
  totalTuitionBilled: 0,
  totalTuitionCollected: 0,
  totalOutstandingBalance: 0,
  averageGpa: 0
};

export const ENROLLMENT_TRENDS_DATA: { term: string; students: number; applications: number; rate: number }[] = [];

export const REVENUE_CASHFLOW_DATA: { month: string; billed: number; collected: number; aid: number }[] = [];

export const DEPARTMENT_METRICS_DATA: { department: string; students: number; courses: number; capacity: number; completion: number }[] = [];

export const DEMOGRAPHICS_DATA: { name: string; value: number; color: string }[] = [];

export const INITIAL_SETTINGS: SystemSettings = {
  institutionName: 'LIPA eLearning Center',
  currentTerm: 'Fall Semester 2026',
  academicYear: '2026 - 2027',
  registrationOpen: true,
  tuitionFeePerCredit: 1150,
  lateFeeCharge: 150,
  gradeSubmissionDeadline: '2026-12-18',
  announcementBanner: 'Welcome to LIPA eLearning Center. Academic session initialized. Course registration and curriculum portals are active.'
};
