export type Role = 'student' | 'instructor' | 'admin';

export type LearnType = 'Online' | 'On Site' | 'Hybrid';
export type CourseMode = 'online' | 'in-person' | 'hybrid';
export type EducationLevel = 'BSC' | 'Master' | 'PHD';
export type ContractLength = '1year' | '2years' | '3years' | '4years' | '5years' | 'Full Time';

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  type: 'document' | 'video' | 'youtube' | 'link';
  url: string;
  fileSize?: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

export interface InstructorAction {
  id: string;
  instructorId: string;
  instructorName: string;
  courseId: string;
  courseTitle: string;
  actionType: 'lesson_planned' | 'assignment_created' | 'material_uploaded' | 'grade_submitted';
  title: string;
  details: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  gender?: 'Male' | 'Female' | 'Other';
  avatar: string;
  coverPhoto?: string;
  department: string;
  studentId?: string;
  facultyId?: string;
  academicYear?: string;
  major?: string;
  title?: string;
  phone?: string;
  whatsApp?: string;
  dateOfBirth?: string;
  address?: string;
  learnType?: LearnType;
  selectedCourseId?: string;
  selectedCourseName?: string;
  educationLevel?: EducationLevel;
  contractLength?: ContractLength;
  assignedCourseIds?: string[];
  joinedDate: string;
  status: 'active' | 'inactive' | 'leave' | 'suspended';
  passwordSet?: boolean;
  defaultPassword?: string;
  totalDue?: number;
  paidAmount?: number;
  balanceOwed?: number;
  isScholarship?: boolean;
  scholarshipType?: string;
  scholarshipPercentage?: number;
  portalActive?: boolean;
  enrollmentConfirmed?: boolean;
  financialStatus?: 'pending' | 'partial' | 'cleared';
  paymentMethod?: string;
  lastPaymentDate?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  classroom?: string;
  credits?: number;
  tuitionFee?: number;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  schedule: string;
  room: string;
  location?: 'Online' | 'On-site';
  color: string;
  capacity: number;
  enrolledCount: number;
  term: string;
  description: string;
  duration?: string;
  mode?: CourseMode;
  materials?: CourseMaterial[];
  syllabusModules: SyllabusModule[];
}

export interface SyllabusModule {
  id: string;
  week: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  durationMinutes: number;
}

export interface StudentCourseProgress {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string;
  credits: number;
  progressPercent: number;
  currentGrade: string;
  currentScore: number;
  attendancePercent: number;
  nextMilestone: string;
  nextDue: string;
  color: string;
}

export interface ScheduleEvent {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Seminar' | 'Office Hours';
  color: string;
}

export interface GradeItem {
  id: string;
  courseId: string;
  courseCode: string;
  assignmentName: string;
  category: 'Exam' | 'Quiz' | 'Lab Project' | 'Homework' | 'Participation';
  maxScore: number;
  earnedScore: number;
  weight: number;
  gradedDate: string;
  feedback?: string;
}

export interface CourseGradeSummary {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  letterGrade: string;
  gpaValue: number;
  percentage: number;
  items: GradeItem[];
}

export type AllowedPaymentMethod = 'Credit Card' | 'Mobile Money' | 'Direct Cash in Person' | 'Visa Card' | 'Direct Cash';

export interface TuitionStatement {
  semester: string;
  academicYear: string;
  totalTuition: number;
  totalDue?: number;
  labFees: number;
  technologyFee: number;
  studentServicesFee: number;
  scholarshipGrant: number;
  totalPaid: number;
  balanceDue: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'overdue';
  lineItems?: {
    id: string;
    courseCode?: string;
    description: string;
    credits?: number;
    feePerCredit?: number;
    totalAmount: number;
    status: 'paid' | 'unpaid';
    category?: 'tuition' | 'fee';
  }[];
}

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  category?: 'Tuition' | 'Course Payment' | 'Institutional Fee';
  method: AllowedPaymentMethod;
  status: 'Completed' | 'Processing' | 'Failed';
  description: string;
  payerName: string;
  studentId?: string;
  studentEmail?: string;
  term: string;
  referenceCode: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  room: string;
  type: 'Lecture' | 'Lab Workshop' | 'Review Session';
  learningObjectives: string[];
  materials: { name: string; type: string; size: string }[];
  status: 'scheduled' | 'live' | 'completed';
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  dueDate: string;
  totalPoints: number;
  submissionsCount: number;
  totalStudents: number;
  averageScore?: number;
  description: string;
  isProject?: boolean;
  projectBrief?: string;
  submissionType?: 'repository' | 'zip_archive' | 'document' | 'all';
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  courseId?: string;
  courseCode?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentAvatar?: string;
  submittedAt?: string;
  submittedDate?: string;
  status: 'graded' | 'pending';
  score?: number;
  maxScore: number;
  fileAttachment?: string;
  feedback?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  courseId: string;
  date: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  notes?: string;
}

export interface SystemSettings {
  institutionName: string;
  currentTerm: string;
  academicYear: string;
  registrationOpen: boolean;
  tuitionFeePerCredit: number;
  lateFeeCharge: number;
  gradeSubmissionDeadline: string;
  announcementBanner: string;
}

export interface AdminAnalytics {
  totalStudents: number;
  totalInstructors: number;
  activeCourses: number;
  newApplicationsThisTerm: number;
  overallCompletionRate: number;
  totalTuitionBilled: number;
  totalTuitionCollected: number;
  totalOutstandingBalance: number;
  averageGpa: number;
}

export interface EmailNotificationItem {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  type: 'registration_password_setup' | 'payment_activated' | 'partial_payment_update' | 'project_assigned';
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
  studentId?: string;
  tempPassword?: string;
  isRead?: boolean;
}

export type ActivityCategory = 'auth' | 'course' | 'system' | 'finance' | 'student' | 'academic';
export type ActivitySeverity = 'info' | 'warning' | 'critical';

export interface ActivityLog {
  id: string;
  action: string;
  category: ActivityCategory;
  actorId: string;
  actorName: string;
  actorRole: 'student' | 'instructor' | 'admin' | 'system';
  target?: string;
  details: string;
  severity: ActivitySeverity;
  ipAddress?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
