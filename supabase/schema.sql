-- ============================================================================
-- LIBERIA INSTITUTE OF PUBLIC ADMINISTRATION (LIPA) eLEARNING CENTER
-- SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA MASK
-- Architecture: Role-Based Access Control (Admin, Instructor, Student)
-- Generated for Supabase Auth, PostgreSQL 15+, Row Level Security (RLS)
-- ============================================================================

-- 1. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. CUSTOM DOMAINS & ENUM TYPES
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'leave', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE learn_type AS ENUM ('Online', 'On Site', 'Hybrid');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE course_mode AS ENUM ('in-person', 'online', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE education_level AS ENUM ('BSC', 'Master', 'PHD');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE contract_length AS ENUM ('1year', '2years', '3years', '4years', '5years', 'Full Time');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE material_type AS ENUM ('video', 'document', 'youtube', 'link');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE lesson_type AS ENUM ('Lecture', 'Lab Workshop', 'Review Session', 'Seminar');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE lesson_status AS ENUM ('scheduled', 'live', 'completed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('pending', 'graded');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'excused');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('Completed', 'Processing', 'Failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE instructor_action_type AS ENUM ('lesson_planned', 'assignment_created', 'material_uploaded', 'grade_submitted');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 3. CORE PROFILES TABLE (Linked to auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    avatar_url TEXT,
    cover_photo_url TEXT,
    department TEXT NOT NULL DEFAULT 'Public Administration & Management',
    
    -- Student-Specific Fields
    student_id TEXT UNIQUE,
    academic_year TEXT,
    major TEXT,
    learn_type learn_type DEFAULT 'On Site',
    date_of_birth DATE,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    
    -- Faculty-Specific Fields
    faculty_id TEXT UNIQUE,
    title TEXT,
    education_level education_level DEFAULT 'Master',
    contract_length contract_length DEFAULT 'Full Time',
    assigned_classes_count INTEGER DEFAULT 0,
    total_students_count INTEGER DEFAULT 0,
    
    -- Account Status & Credentials
    status user_status NOT NULL DEFAULT 'active',
    password_set BOOLEAN DEFAULT false,
    portal_active BOOLEAN DEFAULT true,
    enrollment_confirmed BOOLEAN DEFAULT true,
    
    -- Financial Information (Bursar & Student Ledger)
    financial_status TEXT DEFAULT 'active',
    total_due NUMERIC(10, 2) DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) DEFAULT 0.00,
    balance_owed NUMERIC(10, 2) DEFAULT 0.00,
    is_scholarship BOOLEAN DEFAULT false,
    scholarship_type TEXT,
    scholarship_percentage NUMERIC(5, 2) DEFAULT 0.00,
    payment_method TEXT,
    last_payment_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 4. ACADEMIC CATALOG & COURSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    classroom TEXT,
    credits INTEGER NOT NULL DEFAULT 3 CHECK (credits > 0),
    tuition_fee NUMERIC(10, 2) NOT NULL DEFAULT 3450.00,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    instructor_name TEXT,
    schedule TEXT NOT NULL,
    room TEXT NOT NULL,
    location TEXT,
    color TEXT DEFAULT '#1e3a8a',
    capacity INTEGER NOT NULL DEFAULT 40 CHECK (capacity > 0),
    enrolled_count INTEGER NOT NULL DEFAULT 0 CHECK (enrolled_count >= 0),
    term TEXT NOT NULL DEFAULT 'Fall Semester 2026',
    description TEXT,
    duration TEXT DEFAULT '14 Weeks',
    mode course_mode NOT NULL DEFAULT 'in-person',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 5. COURSE MATERIALS & DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.course_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type material_type NOT NULL DEFAULT 'document',
    url TEXT NOT NULL,
    file_size TEXT,
    description TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 6. SYLLABUS & CURRICULUM MODULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.syllabus_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    week INTEGER NOT NULL CHECK (week > 0),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('completed', 'in_progress', 'upcoming')),
    duration_minutes INTEGER DEFAULT 180,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 7. STUDENT COURSE ENROLLMENTS & PROGRESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    credits INTEGER DEFAULT 3,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    current_grade TEXT DEFAULT 'A',
    current_score NUMERIC(5, 2) DEFAULT 95.00 CHECK (current_score >= 0 AND current_score <= 100),
    attendance_percent NUMERIC(5, 2) DEFAULT 100.00 CHECK (attendance_percent >= 0 AND attendance_percent <= 100),
    next_milestone TEXT,
    next_due TEXT,
    enrolled_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_student_course_enrollment UNIQUE(student_id, course_id)
);

-- ============================================================================
-- 8. LESSONS & CLASS SCHEDULE SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_code TEXT,
    course_title TEXT,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 90,
    room TEXT,
    type lesson_type DEFAULT 'Lecture',
    learning_objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
    materials JSONB DEFAULT '[]'::jsonb,
    status lesson_status DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 9. ASSIGNMENTS & CLASS PROJECTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_code TEXT,
    course_title TEXT,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 100 CHECK (total_points > 0),
    is_project BOOLEAN DEFAULT false,
    project_brief TEXT,
    submission_type TEXT DEFAULT 'File Upload',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 10. STUDENT SUBMISSIONS & GRADING ASSESSMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT,
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status submission_status DEFAULT 'pending',
    score NUMERIC(5, 2),
    max_score NUMERIC(5, 2) DEFAULT 100.00,
    file_attachment TEXT,
    feedback TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_student_assignment_submission UNIQUE(assignment_id, student_id)
);

-- ============================================================================
-- 11. ATTENDANCE TRACKING LEDGER
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_student_course_attendance UNIQUE(student_id, course_id, date)
);

-- ============================================================================
-- 12. BURSAR PAYMENT TRANSACTIONS & OFFICIAL RECEIPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT NOT NULL UNIQUE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    payer_name TEXT NOT NULL,
    student_email TEXT,
    date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    category TEXT DEFAULT 'Tuition',
    method TEXT NOT NULL,
    status payment_status DEFAULT 'Completed',
    description TEXT,
    term TEXT DEFAULT 'Fall Semester 2026',
    reference_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 13. TUITION BILLING STATEMENTS & LINE ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tuition_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    semester TEXT NOT NULL DEFAULT 'Fall Semester 2026',
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    total_tuition NUMERIC(10, 2) DEFAULT 0.00,
    lab_fees NUMERIC(10, 2) DEFAULT 0.00,
    technology_fee NUMERIC(10, 2) DEFAULT 0.00,
    student_services_fee NUMERIC(10, 2) DEFAULT 0.00,
    scholarship_grant NUMERIC(10, 2) DEFAULT 0.00,
    total_paid NUMERIC(10, 2) DEFAULT 0.00,
    balance_due NUMERIC(10, 2) DEFAULT 0.00,
    due_date DATE,
    status TEXT DEFAULT 'active',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_student_semester_statement UNIQUE(student_id, semester, academic_year)
);

CREATE TABLE IF NOT EXISTS public.statement_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id UUID NOT NULL REFERENCES public.tuition_statements(id) ON DELETE CASCADE,
    course_code TEXT NOT NULL,
    description TEXT NOT NULL,
    credits INTEGER DEFAULT 3,
    fee_per_credit NUMERIC(10, 2) DEFAULT 1150.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Settled',
    category TEXT DEFAULT 'Tuition'
);

-- ============================================================================
-- 14. WEEKLY TIMETABLE SCHEDULE EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.schedule_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_title TEXT,
    course_code TEXT,
    instructor_name TEXT,
    day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT NOT NULL,
    type TEXT DEFAULT 'Lecture',
    color TEXT DEFAULT '#1e3a8a'
);

-- ============================================================================
-- 15. INSTRUCTOR AUDIT TRAIL & ACTIONS MONITOR
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.instructor_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    instructor_name TEXT NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    course_title TEXT,
    action_type instructor_action_type NOT NULL,
    title TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 16. OFFICIAL EMAIL NOTIFICATIONS DISPATCHER
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    action_url TEXT,
    action_text TEXT,
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    temp_password TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 17. INSTITUTIONAL SYSTEM SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_name TEXT NOT NULL DEFAULT 'Liberia Institute of Public Administration (LIPA)',
    current_term TEXT NOT NULL DEFAULT 'Fall Semester 2026',
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    registration_open BOOLEAN DEFAULT true,
    tuition_fee_per_credit NUMERIC(10, 2) DEFAULT 1150.00,
    late_fee_charge NUMERIC(10, 2) DEFAULT 150.00,
    grade_submission_deadline DATE DEFAULT '2026-12-18',
    announcement_banner TEXT DEFAULT 'Official Notice: Fall 2026 Registration is Active. Ensure tuition clearance prior to midterm examinations.',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 18. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_term ON public.courses(term);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_course ON public.course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.student_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.student_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_course ON public.attendance_records(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON public.payment_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_statements_student ON public.tuition_statements(student_id);
CREATE INDEX IF NOT EXISTS idx_instructor_actions_instructor ON public.instructor_actions(instructor_id);

-- ============================================================================
-- 19. DATABASE TRIGGERS & AUTOMATED FUNCTIONS
-- ============================================================================

-- Function: Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_enrollments_updated_at ON public.enrollments;
CREATE TRIGGER trg_enrollments_updated_at
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_submissions_updated_at ON public.student_submissions;
CREATE TRIGGER trg_submissions_updated_at
    BEFORE UPDATE ON public.student_submissions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function: Maintain enrolled_count on courses automatically
CREATE OR REPLACE FUNCTION public.sync_course_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.courses
        SET enrolled_count = enrolled_count + 1
        WHERE id = NEW.course_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.courses
        SET enrolled_count = GREATEST(0, enrolled_count - 1)
        WHERE id = OLD.course_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_course_enrolled_count ON public.enrollments;
CREATE TRIGGER trg_sync_course_enrolled_count
    AFTER INSERT OR DELETE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION public.sync_course_enrolled_count();

-- Function: Handle New Supabase Auth User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        name,
        email,
        role,
        department,
        status,
        portal_active,
        enrollment_confirmed
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Public Administration & Management'),
        'active',
        true,
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Call on auth.users create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 20. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statement_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current authenticated user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: Is current authenticated user an instructor?
CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'instructor'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS: PROFILES
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin());

-- RLS: COURSES
CREATE POLICY "Courses are viewable by authenticated users"
    ON public.courses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Instructors and Admins can create courses"
    ON public.courses FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin() OR public.is_instructor());

CREATE POLICY "Instructors and Admins can update courses"
    ON public.courses FOR UPDATE
    TO authenticated
    USING (public.is_admin() OR (public.is_instructor() AND instructor_id = auth.uid()));

CREATE POLICY "Only admins can delete courses"
    ON public.courses FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- RLS: ENROLLMENTS
CREATE POLICY "Students can view own enrollments"
    ON public.enrollments FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.is_admin() OR public.is_instructor());

CREATE POLICY "Admins can manage enrollments"
    ON public.enrollments FOR ALL
    TO authenticated
    USING (public.is_admin());

-- RLS: ASSIGNMENTS & SUBMISSIONS
CREATE POLICY "Assignments are viewable by authenticated users"
    ON public.assignments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Faculty and Admins can manage assignments"
    ON public.assignments FOR ALL
    TO authenticated
    USING (public.is_instructor() OR public.is_admin());

CREATE POLICY "Students can view and create own submissions"
    ON public.student_submissions FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.is_instructor() OR public.is_admin());

CREATE POLICY "Students can submit assignments"
    ON public.student_submissions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty can grade submissions"
    ON public.student_submissions FOR UPDATE
    TO authenticated
    USING (public.is_instructor() OR public.is_admin());

-- RLS: FINANCIALS & RECEIPTS
CREATE POLICY "Students can view own financial records"
    ON public.payment_transactions FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can view own tuition statement"
    ON public.tuition_statements FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage all financial records"
    ON public.payment_transactions FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can manage tuition statements"
    ON public.tuition_statements FOR ALL
    TO authenticated
    USING (public.is_admin());

-- RLS: SYSTEM SETTINGS
CREATE POLICY "System settings are viewable by all authenticated users"
    ON public.system_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can update system settings"
    ON public.system_settings FOR UPDATE
    TO authenticated
    USING (public.is_admin());
