import React, { useState } from 'react';
import {
  Database,
  Code,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Layers,
  Key,
  Users,
  BookOpen,
  CreditCard,
  FileCheck,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
  Server,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { getSupabaseConfigStatus } from '../../lib/supabase';

interface TableDefinition {
  name: string;
  category: 'auth_users' | 'academics' | 'evaluations' | 'financials' | 'system';
  description: string;
  primaryKey: string;
  columns: {
    name: string;
    type: string;
    constraints?: string;
    description: string;
  }[];
  relationships?: string[];
  rlsPolicies?: string[];
}

const DATABASE_TABLES: TableDefinition[] = [
  {
    name: 'public.profiles',
    category: 'auth_users',
    description: 'Central user identity table linked to auth.users. Houses student, faculty, and administrator dossiers, academic credentials, and financial standing.',
    primaryKey: 'id (UUID)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, FK auth.users(id) ON DELETE CASCADE', description: 'Unique authentication user UUID' },
      { name: 'role', type: 'user_role', constraints: 'NOT NULL DEFAULT student', description: 'User role: student | instructor | admin' },
      { name: 'name', type: 'TEXT', constraints: 'NOT NULL', description: 'Full legal name' },
      { name: 'email', type: 'TEXT', constraints: 'NOT NULL UNIQUE', description: 'Primary institutional email' },
      { name: 'gender', type: 'TEXT', constraints: 'CHECK Male/Female/Other', description: 'Gender demographic record' },
      { name: 'avatar_url', type: 'TEXT', description: 'Cloud storage URL or data image' },
      { name: 'cover_photo_url', type: 'TEXT', description: 'Student profile campus cover image' },
      { name: 'department', type: 'TEXT', constraints: 'NOT NULL', description: 'Academic department or division' },
      { name: 'student_id', type: 'TEXT', constraints: 'UNIQUE', description: 'Unique student matriculation ID (e.g. STU-2026-001)' },
      { name: 'faculty_id', type: 'TEXT', constraints: 'UNIQUE', description: 'Faculty identification ID (e.g. FAC-2026-001)' },
      { name: 'academic_year', type: 'TEXT', description: 'Senior, Junior, Sophomore, Freshman' },
      { name: 'major', type: 'TEXT', description: 'Declared field of study' },
      { name: 'learn_type', type: 'learn_type', constraints: 'Online | On Site | Hybrid', description: 'Mode of institutional instruction' },
      { name: 'title', type: 'TEXT', description: 'Faculty academic title (e.g. Professor, Lecturer)' },
      { name: 'education_level', type: 'education_level', constraints: 'BSC | Master | PHD', description: 'Highest attained degree for faculty' },
      { name: 'contract_length', type: 'contract_length', description: 'Faculty contract tenure (1year to Full Time)' },
      { name: 'status', type: 'user_status', constraints: 'active | inactive | leave | suspended', description: 'Operational account standing' },
      { name: 'total_due', type: 'NUMERIC(10,2)', constraints: 'DEFAULT 0.00', description: 'Total tuition and institutional fees assessed' },
      { name: 'paid_amount', type: 'NUMERIC(10,2)', constraints: 'DEFAULT 0.00', description: 'Total verified cleared bursar payments' },
      { name: 'balance_owed', type: 'NUMERIC(10,2)', constraints: 'DEFAULT 0.00', description: 'Remaining balance due' },
      { name: 'is_scholarship', type: 'BOOLEAN', constraints: 'DEFAULT false', description: 'Whether student receives scholarship aid' },
      { name: 'scholarship_percentage', type: 'NUMERIC(5,2)', description: 'Tuition waiver percentage' }
    ],
    relationships: ['1:1 with auth.users', '1:N with enrollments', '1:N with payment_transactions', '1:N with instructor_actions'],
    rlsPolicies: ['Public profiles readable by authenticated', 'Users can update own profile', 'Admins have full access']
  },
  {
    name: 'public.courses',
    category: 'academics',
    description: 'Master academic course catalog with credit allocations, tuition billing rates, classroom venues, and assigned instructors.',
    primaryKey: 'id (UUID)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK DEFAULT gen_random_uuid()', description: 'Course identifier' },
      { name: 'code', type: 'TEXT', constraints: 'NOT NULL UNIQUE', description: 'Institutional course code (e.g. PA-401)' },
      { name: 'title', type: 'TEXT', constraints: 'NOT NULL', description: 'Course title' },
      { name: 'department', type: 'TEXT', constraints: 'NOT NULL', description: 'Host academic department' },
      { name: 'credits', type: 'INTEGER', constraints: 'NOT NULL DEFAULT 3', description: 'Academic credit weighting' },
      { name: 'tuition_fee', type: 'NUMERIC(10,2)', constraints: 'NOT NULL', description: 'Calculated course tuition charge' },
      { name: 'instructor_id', type: 'UUID', constraints: 'FK profiles(id) ON DELETE SET NULL', description: 'Lead faculty instructor' },
      { name: 'schedule', type: 'TEXT', constraints: 'NOT NULL', description: 'Days and lecture time interval' },
      { name: 'room', type: 'TEXT', constraints: 'NOT NULL', description: 'Lecture hall / room number' },
      { name: 'capacity', type: 'INTEGER', constraints: 'NOT NULL DEFAULT 40', description: 'Maximum student seat capacity' },
      { name: 'enrolled_count', type: 'INTEGER', constraints: 'DEFAULT 0', description: 'Live enrolled student count (auto-updated by trigger)' },
      { name: 'mode', type: 'course_mode', constraints: 'in-person | online | hybrid', description: 'Delivery format' }
    ],
    relationships: ['N:1 with profiles (instructor)', '1:N with enrollments', '1:N with lessons', '1:N with assignments', '1:N with course_materials'],
    rlsPolicies: ['Courses readable by all authenticated users', 'Faculty and Admins can create/edit', 'Only Admins can delete']
  },
  {
    name: 'public.enrollments',
    category: 'academics',
    description: 'Student-to-course enrollments. Tracks syllabus progress percentage, current grade letter, cumulative exam scores, and attendance percentage.',
    primaryKey: 'id (UUID)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK DEFAULT gen_random_uuid()', description: 'Enrollment record UUID' },
      { name: 'student_id', type: 'UUID', constraints: 'FK profiles(id) ON DELETE CASCADE', description: 'Enrolled student profile' },
      { name: 'course_id', type: 'UUID', constraints: 'FK courses(id) ON DELETE CASCADE', description: 'Academic course record' },
      { name: 'progress_percent', type: 'INTEGER', constraints: 'DEFAULT 0 CHECK 0-100', description: 'Curriculum completion rate' },
      { name: 'current_grade', type: 'TEXT', constraints: 'DEFAULT A', description: 'Assessed letter grade (A, B, C, D, F)' },
      { name: 'current_score', type: 'NUMERIC(5,2)', constraints: 'DEFAULT 95.00', description: 'Numerical average out of 100' },
      { name: 'attendance_percent', type: 'NUMERIC(5,2)', constraints: 'DEFAULT 100.00', description: 'Attendance rate percentage' }
    ],
    relationships: ['UNIQUE(student_id, course_id)', 'N:1 with profiles (student)', 'N:1 with courses'],
    rlsPolicies: ['Students read own enrollments', 'Instructors read enrollments for their classes', 'Admins have full access']
  },
  {
    name: 'public.assignments',
    category: 'evaluations',
    description: 'Faculty-created academic assignments and projects with due dates, point weights, and deliverable briefs.',
    primaryKey: 'id (UUID)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK DEFAULT gen_random_uuid()', description: 'Assignment UUID' },
      { name: 'course_id', type: 'UUID', constraints: 'FK courses(id) ON DELETE CASCADE', description: 'Host course' },
      { name: 'title', type: 'TEXT', constraints: 'NOT NULL', description: 'Assignment title' },
      { name: 'due_date', type: 'DATE', constraints: 'NOT NULL', description: 'Submission cutoff date' },
      { name: 'total_points', type: 'INTEGER', constraints: 'NOT NULL DEFAULT 100', description: 'Maximum score value' },
      { name: 'is_project', type: 'BOOLEAN', constraints: 'DEFAULT false', description: 'Flag distinguishing major course projects' },
      { name: 'project_brief', type: 'TEXT', description: 'Detailed project deliverables & requirements' },
      { name: 'submission_type', type: 'TEXT', constraints: 'DEFAULT File Upload', description: 'Upload format or link' }
    ],
    relationships: ['N:1 with courses', '1:N with student_submissions'],
    rlsPolicies: ['Readable by authenticated users', 'Instructors and Admins can create and modify']
  },
  {
    name: 'public.student_submissions',
    category: 'evaluations',
    description: 'Student assignment and project deliverables, uploaded files, assigned scores, and instructor feedback remarks.',
    primaryKey: 'id (UUID)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK DEFAULT gen_random_uuid()', description: 'Submission UUID' },
      { name: 'assignment_id', type: 'UUID', constraints: 'FK assignments(id) ON DELETE CASCADE', description: 'Target assignment' },
      { name: 'student_id', type: 'UUID', constraints: 'FK profiles(id) ON DELETE CASCADE', description: 'Submitting student' },
      { name: 'submitted_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Submission timestamp' },
      { name: 'status', type: 'submission_status', constraints: 'pending | graded', description: 'Grading status' },
      { name: 'score', type: 'NUMERIC(5,2)', description: 'Awarded score points' },
      { name: 'file_attachment', type: 'TEXT', description: 'Document URL or submission body' },
      { name: 'feedback', type: 'TEXT', description: 'Faculty assessment comments' }
    ],
    relationships: ['UNIQUE(assignment_id, student_id)', 'N:1 with assignments', 'N:1 with profiles (student)'],
    rlsPolicies: ['Students read and submit own work', 'Instructors can read and grade submissions', 'Admins full access']
  },
  {
    name: 'public.payment_transactions',
    category: 'financials',
    description: 'Official Bursar payment transactions, receipts, payment gateway references, and cleared tuition installments.',
    primaryKey: 'id (UUID)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK DEFAULT gen_random_uuid()', description: 'Transaction UUID' },
      { name: 'receipt_number', type: 'TEXT', constraints: 'NOT NULL UNIQUE', description: 'Official receipt code (e.g. RCP-2026-4892)' },
      { name: 'student_id', type: 'UUID', constraints: 'FK profiles(id) ON DELETE SET NULL', description: 'Student profile' },
      { name: 'payer_name', type: 'TEXT', constraints: 'NOT NULL', description: 'Name of remitter' },
      { name: 'amount', type: 'NUMERIC(10,2)', constraints: 'NOT NULL CHECK > 0', description: 'Remitted payment sum' },
      { name: 'category', type: 'TEXT', constraints: 'DEFAULT Tuition', description: 'Tuition, Lab Fee, Technology, Library' },
      { name: 'method', type: 'TEXT', constraints: 'NOT NULL', description: 'Orange Money, Lonestar MTN MoMo, Bank Wire, Credit Card' },
      { name: 'status', type: 'payment_status', constraints: 'Completed | Processing | Failed', description: 'Transaction settlement state' },
      { name: 'reference_code', type: 'TEXT', constraints: 'UNIQUE', description: 'Bank / Gateway reference code' }
    ],
    relationships: ['N:1 with profiles (student)'],
    rlsPolicies: ['Students view own transactions', 'Admins have full access to manage and create records']
  },
  {
    name: 'public.tuition_statements',
    category: 'financials',
    description: 'Semester billing statements itemizing tuition assessments, lab fees, technology fees, scholarship grants, and balance due.',
    primaryKey: 'id (UUID)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK DEFAULT gen_random_uuid()', description: 'Statement UUID' },
      { name: 'student_id', type: 'UUID', constraints: 'FK profiles(id) ON DELETE CASCADE', description: 'Billed student' },
      { name: 'semester', type: 'TEXT', constraints: 'NOT NULL', description: 'Academic term' },
      { name: 'total_tuition', type: 'NUMERIC(10,2)', constraints: 'DEFAULT 0.00', description: 'Gross course tuition' },
      { name: 'scholarship_grant', type: 'NUMERIC(10,2)', constraints: 'DEFAULT 0.00', description: 'Awarded scholarship deduction' },
      { name: 'total_paid', type: 'NUMERIC(10,2)', constraints: 'DEFAULT 0.00', description: 'Sum of cleared payments' },
      { name: 'balance_due', type: 'NUMERIC(10,2)', constraints: 'DEFAULT 0.00', description: 'Current payable balance' }
    ],
    relationships: ['UNIQUE(student_id, semester, academic_year)', '1:N with statement_line_items'],
    rlsPolicies: ['Students read own statements', 'Admins can update and manage']
  },
  {
    name: 'public.instructor_actions',
    category: 'evaluations',
    description: 'Immutable faculty action log tracking lesson plans, project dispatches, assignment creation, and grade submissions for administrative auditing.',
    primaryKey: 'id (UUID)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK DEFAULT gen_random_uuid()', description: 'Audit log UUID' },
      { name: 'instructor_id', type: 'UUID', constraints: 'FK profiles(id) ON DELETE CASCADE', description: 'Executing faculty member' },
      { name: 'course_title', type: 'TEXT', description: 'Related course title' },
      { name: 'action_type', type: 'instructor_action_type', constraints: 'NOT NULL', description: 'Action classification' },
      { name: 'title', type: 'TEXT', constraints: 'NOT NULL', description: 'Action headline' },
      { name: 'details', type: 'TEXT', description: 'Specific metadata and audit notes' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Timestamp of action' }
    ],
    relationships: ['N:1 with profiles (faculty)', 'N:1 with courses'],
    rlsPolicies: ['Instructors insert actions', 'Admins can view and audit all actions']
  },
  {
    name: 'public.system_settings',
    category: 'system',
    description: 'Global university configurations: academic term name, tuition rate per credit, registration window, and campus announcements.',
    primaryKey: 'id (UUID)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK DEFAULT gen_random_uuid()', description: 'Settings record' },
      { name: 'institution_name', type: 'TEXT', constraints: 'NOT NULL', description: 'Official university title' },
      { name: 'current_term', type: 'TEXT', constraints: 'NOT NULL', description: 'Active academic semester' },
      { name: 'tuition_fee_per_credit', type: 'NUMERIC(10,2)', constraints: 'DEFAULT 1150.00', description: 'Base rate per credit' },
      { name: 'registration_open', type: 'BOOLEAN', constraints: 'DEFAULT true', description: 'Student enrollment status' },
      { name: 'announcement_banner', type: 'TEXT', description: 'Top broadcast banner' }
    ],
    relationships: ['Single configuration entity'],
    rlsPolicies: ['Readable by all authenticated users', 'Only Admins can modify']
  }
];

const RAW_SQL_SCHEMA = `-- ============================================================================
-- LIBERIA INSTITUTE OF PUBLIC ADMINISTRATION (LIPA) eLEARNING CENTER
-- SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'leave', 'suspended');
CREATE TYPE learn_type AS ENUM ('Online', 'On Site', 'Hybrid');
CREATE TYPE course_mode AS ENUM ('in-person', 'online', 'hybrid');
CREATE TYPE education_level AS ENUM ('BSC', 'Master', 'PHD');
CREATE TYPE contract_length AS ENUM ('1year', '2years', '3years', '4years', '5years', 'Full Time');
CREATE TYPE material_type AS ENUM ('video', 'document', 'youtube', 'link');
CREATE TYPE lesson_type AS ENUM ('Lecture', 'Lab Workshop', 'Review Session', 'Seminar');
CREATE TYPE lesson_status AS ENUM ('scheduled', 'live', 'completed');
CREATE TYPE submission_status AS ENUM ('pending', 'graded');
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'excused');
CREATE TYPE payment_status AS ENUM ('Completed', 'Processing', 'Failed');
CREATE TYPE instructor_action_type AS ENUM ('lesson_planned', 'assignment_created', 'material_uploaded', 'grade_submitted');

-- PROFILES (Linked to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    avatar_url TEXT,
    cover_photo_url TEXT,
    department TEXT NOT NULL DEFAULT 'Public Administration & Management',
    student_id TEXT UNIQUE,
    academic_year TEXT,
    major TEXT,
    learn_type learn_type DEFAULT 'On Site',
    date_of_birth DATE,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    faculty_id TEXT UNIQUE,
    title TEXT,
    education_level education_level DEFAULT 'Master',
    contract_length contract_length DEFAULT 'Full Time',
    status user_status NOT NULL DEFAULT 'active',
    password_set BOOLEAN DEFAULT false,
    portal_active BOOLEAN DEFAULT true,
    enrollment_confirmed BOOLEAN DEFAULT true,
    total_due NUMERIC(10, 2) DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) DEFAULT 0.00,
    balance_owed NUMERIC(10, 2) DEFAULT 0.00,
    is_scholarship BOOLEAN DEFAULT false,
    scholarship_type TEXT,
    scholarship_percentage NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- COURSES
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 3,
    tuition_fee NUMERIC(10, 2) NOT NULL DEFAULT 3450.00,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    instructor_name TEXT,
    schedule TEXT NOT NULL,
    room TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 40,
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    term TEXT NOT NULL DEFAULT 'Fall Semester 2026',
    description TEXT,
    mode course_mode NOT NULL DEFAULT 'in-person',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ENROLLMENTS
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    credits INTEGER DEFAULT 3,
    progress_percent INTEGER DEFAULT 0,
    current_grade TEXT DEFAULT 'A',
    current_score NUMERIC(5, 2) DEFAULT 95.00,
    attendance_percent NUMERIC(5, 2) DEFAULT 100.00,
    enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_student_course_enrollment UNIQUE(student_id, course_id)
);

-- ASSIGNMENTS & DELIVERABLES
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_code TEXT,
    course_title TEXT,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 100,
    is_project BOOLEAN DEFAULT false,
    project_brief TEXT,
    submission_type TEXT DEFAULT 'File Upload',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- STUDENT SUBMISSIONS
CREATE TABLE public.student_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status submission_status DEFAULT 'pending',
    score NUMERIC(5, 2),
    max_score NUMERIC(5, 2) DEFAULT 100.00,
    file_attachment TEXT,
    feedback TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_student_assignment_submission UNIQUE(assignment_id, student_id)
);

-- BURSAR PAYMENT TRANSACTIONS
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT NOT NULL UNIQUE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    payer_name TEXT NOT NULL,
    student_email TEXT,
    date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category TEXT DEFAULT 'Tuition',
    method TEXT NOT NULL,
    status payment_status DEFAULT 'Completed',
    term TEXT DEFAULT 'Fall Semester 2026',
    reference_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- TUITION BILLING STATEMENTS
CREATE TABLE public.tuition_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    semester TEXT NOT NULL DEFAULT 'Fall Semester 2026',
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    total_tuition NUMERIC(10, 2) DEFAULT 0.00,
    scholarship_grant NUMERIC(10, 2) DEFAULT 0.00,
    total_paid NUMERIC(10, 2) DEFAULT 0.00,
    balance_due NUMERIC(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_student_semester_statement UNIQUE(student_id, semester, academic_year)
);

-- ROW LEVEL SECURITY ENABLEMENT
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_statements ENABLE ROW LEVEL SECURITY;

-- AUTO SYNC ENROLLED COUNT TRIGGER
CREATE OR REPLACE FUNCTION public.sync_course_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.courses SET enrolled_count = enrolled_count + 1 WHERE id = NEW.course_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.courses SET enrolled_count = GREATEST(0, enrolled_count - 1) WHERE id = OLD.course_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_course_enrolled_count
    AFTER INSERT OR DELETE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION public.sync_course_enrolled_count();
`;

export const DatabaseSchemaPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTable, setExpandedTable] = useState<string | null>('public.profiles');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'tables' | 'sql' | 'architecture'>('tables');

  const configStatus = getSupabaseConfigStatus();

  const handleCopySql = () => {
    navigator.clipboard.writeText(RAW_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([RAW_SQL_SCHEMA], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lipa_supabase_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredTables = selectedCategory === 'all'
    ? DATABASE_TABLES
    : DATABASE_TABLES.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0c1a30] via-[#122442] to-[#0c1a30] rounded-2xl p-6 text-white border border-[#1d355a] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PostgreSQL 15+ / Supabase
              </span>
              <span className="text-slate-400 text-xs font-mono">• Production Ready</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-400" />
              Supabase Database Schema Mask
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Complete relational database architecture for student dossiers, faculty assignments, classroom curricula, submissions, and bursar payment ledgers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopySql}
              id="btn-copy-schema-sql"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center shadow-xs border border-white/15 cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadSql}
              id="btn-download-schema-sql"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Download .sql</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            configStatus.isConfigured
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">Supabase Cloud Connection:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                configStatus.isConfigured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {configStatus.isConfigured ? 'Connected to Project' : 'Schema Mask Ready (Unlinked)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {configStatus.isConfigured
                ? `Connected to: ${configStatus.url}`
                : 'Schema is ready to be executed directly in your Supabase SQL Editor'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('tables')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'tables'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Tables &amp; Field Masks ({DATABASE_TABLES.length})
          </button>
          <button
            onClick={() => setViewMode('sql')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'sql'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Raw SQL Script
          </button>
          <button
            onClick={() => setViewMode('architecture')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'architecture'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Role Architecture &amp; RLS
          </button>
        </div>

        {viewMode === 'tables' && (
          <div className="hidden sm:flex items-center space-x-1.5">
            {['all', 'auth_users', 'academics', 'evaluations', 'financials'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors capitalize ${
                  selectedCategory === cat
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat === 'all' ? 'All Tables' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View: Tables & Field Masks */}
      {viewMode === 'tables' && (
        <div className="space-y-4">
          {filteredTables.map(table => {
            const isExpanded = expandedTable === table.name;
            return (
              <div
                key={table.name}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedTable(isExpanded ? null : table.name)}
                  className="p-5 flex items-start sm:items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors gap-3"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-mono text-xs font-bold">
                      <Terminal className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{table.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          PK: {table.primaryKey}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                          {table.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl">{table.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                      {table.columns.length} columns
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/40 space-y-4 animate-in fade-in duration-100">
                    {/* Columns Table */}
                    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px]">
                            <th className="py-2.5 px-4 font-semibold">Column Name</th>
                            <th className="py-2.5 px-4 font-semibold">Data Type</th>
                            <th className="py-2.5 px-4 font-semibold">Constraints / Default</th>
                            <th className="py-2.5 px-4 font-semibold">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {table.columns.map(col => (
                            <tr key={col.name} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                                {col.name}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-blue-700">
                                {col.type}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px]">
                                {col.constraints || '—'}
                              </td>
                              <td className="py-2.5 px-4 text-slate-600">
                                {col.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Relationships & RLS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {table.relationships && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-1.5 flex items-center">
                            <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                            Relational Mappings
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                            {table.relationships.map((rel, i) => (
                              <li key={i}>{rel}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {table.rlsPolicies && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-1.5 flex items-center">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                            Row Level Security (RLS) Policies
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                            {table.rlsPolicies.map((pol, i) => (
                              <li key={i}>{pol}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* View: Raw SQL Script */}
      {viewMode === 'sql' && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-slate-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-white">lipa_supabase_schema.sql</span>
              <span className="text-[10px] text-slate-400 font-mono">(Ready to run in Supabase SQL Editor)</span>
            </div>
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center cursor-pointer transition-colors border border-slate-700"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-xs font-mono text-emerald-300/90 overflow-x-auto p-4 bg-slate-950 rounded-xl border border-slate-800/80 leading-relaxed max-h-[600px] select-all">
            {RAW_SQL_SCHEMA}
          </pre>
        </div>
      )}

      {/* View: Role Architecture & RLS */}
      {viewMode === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Persona Mask */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student Account Mask</h3>
                  <span className="text-[11px] font-mono text-blue-600">role = 'student'</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Has SELECT access to assigned courses, course materials, lectures, and published assignments. Can submit project deliverables and view verified grades.
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Accessible Tables:</span>
                  <span className="font-semibold text-slate-800">7 Tables</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Write Privileges:</span>
                  <span className="font-semibold text-slate-800">Submissions, Own Profile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bursar Ledger:</span>
                  <span className="font-semibold text-emerald-600">Read Own Receipts</span>
                </div>
              </div>
            </div>

            {/* Faculty Instructor Mask */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Instructor Account Mask</h3>
                  <span className="text-[11px] font-mono text-indigo-600">role = 'instructor'</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Has management access to their assigned teaching classes. Dispatches projects, uploads materials, conducts live classes, records attendance, and submits grades.
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Accessible Tables:</span>
                  <span className="font-semibold text-slate-800">11 Tables</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Write Privileges:</span>
                  <span className="font-semibold text-slate-800">Lessons, Projects, Grades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Audit Trail:</span>
                  <span className="font-semibold text-indigo-600">instructor_actions</span>
                </div>
              </div>
            </div>

            {/* Administrator Mask */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Administrator Mask</h3>
                  <span className="text-[11px] font-mono text-red-600">role = 'admin'</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full institutional governance over user registrations, student enrollments, course catalogs, bursar billing statements, instructor activity monitoring, and system terms.
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Accessible Tables:</span>
                  <span className="font-semibold text-slate-800">All 15+ Tables</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Write Privileges:</span>
                  <span className="font-semibold text-slate-800">Full CRUD Access</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bursar Ledger:</span>
                  <span className="font-semibold text-red-600">Reconcile All Accounts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">How to Apply This Schema to Supabase</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] mb-2">1</span>
                <p className="font-bold text-slate-900">Create Project</p>
                <p className="text-slate-500">Log into Supabase and create a new PostgreSQL database project.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] mb-2">2</span>
                <p className="font-bold text-slate-900">Open SQL Editor</p>
                <p className="text-slate-500">Click on SQL Editor in your Supabase left navigation bar.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] mb-2">3</span>
                <p className="font-bold text-slate-900">Paste &amp; Run</p>
                <p className="text-slate-500">Paste the copied SQL script above and click "Run" to initialize all tables, triggers, and RLS.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] mb-2">4</span>
                <p className="font-bold text-slate-900">Set API Keys</p>
                <p className="text-slate-500">Add <code className="text-blue-600 font-mono">VITE_SUPABASE_URL</code> and <code className="text-blue-600 font-mono">VITE_SUPABASE_ANON_KEY</code> to connect.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
