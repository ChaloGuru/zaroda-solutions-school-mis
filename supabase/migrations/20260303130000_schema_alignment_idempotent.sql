BEGIN;

-- =============================
-- ENUM ALIGNMENT
-- =============================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'performance_level' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.performance_level AS ENUM ('EE', 'ME', 'AE', 'BE');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'activity_type' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.activity_type AS ENUM (
      'formative_assessment',
      'summative_assessment',
      'project',
      'practical',
      'observation',
      'oral_assessment',
      'portfolio'
    );
  END IF;
END $$;

-- =============================
-- CORE TABLES: schools, profiles, assessments
-- =============================
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  school_type TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  county TEXT,
  sub_county TEXT,
  zone TEXT,
  categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  student_count INTEGER NOT NULL DEFAULT 0,
  faculty_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS school_type TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS sub_county TEXT,
  ADD COLUMN IF NOT EXISTS zone TEXT,
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS contact_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS faculty_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.schools
SET school_type = ARRAY[]::TEXT[]
WHERE school_type IS NULL;

ALTER TABLE public.schools
  ALTER COLUMN school_type SET DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.schools
  DROP CONSTRAINT IF EXISTS schools_school_type_valid;

ALTER TABLE public.schools
  ADD CONSTRAINT schools_school_type_valid
  CHECK (school_type <@ ARRAY['ECDE', 'Primary', 'Junior Secondary']::TEXT[]);

ALTER TABLE public.schools
  DROP CONSTRAINT IF EXISTS schools_status_check;

ALTER TABLE public.schools
  ADD CONSTRAINT schools_status_check
  CHECK (status IN ('pending', 'active', 'suspended'));

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  school_id UUID,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'teacher',
  school_code TEXT,
  school_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  subject TEXT,
  grade TEXT,
  is_class_teacher BOOLEAN DEFAULT false,
  class_teacher_class_id UUID,
  class_teacher_class_name TEXT,
  class_teacher_stream_id UUID,
  class_teacher_stream_name TEXT,
  created_by TEXT,
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS school_id UUID,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher',
  ADD COLUMN IF NOT EXISTS school_code TEXT,
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS is_class_teacher BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS class_teacher_class_id UUID,
  ADD COLUMN IF NOT EXISTS class_teacher_class_name TEXT,
  ADD COLUMN IF NOT EXISTS class_teacher_stream_id UUID,
  ADD COLUMN IF NOT EXISTS class_teacher_stream_name TEXT,
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID,
  teacher_name TEXT,
  student_id UUID,
  student_name TEXT,
  admission_no TEXT,
  grade TEXT,
  subject TEXT,
  term INTEGER,
  school_code TEXT,
  activity_type public.activity_type DEFAULT 'summative_assessment',
  performance_level public.performance_level DEFAULT 'ME',
  competency_achieved BOOLEAN DEFAULT false,
  teacher_comment TEXT,
  scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS teacher_id UUID,
  ADD COLUMN IF NOT EXISTS teacher_name TEXT,
  ADD COLUMN IF NOT EXISTS student_id UUID,
  ADD COLUMN IF NOT EXISTS student_name TEXT,
  ADD COLUMN IF NOT EXISTS admission_no TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS term INTEGER,
  ADD COLUMN IF NOT EXISTS school_code TEXT,
  ADD COLUMN IF NOT EXISTS activity_type public.activity_type,
  ADD COLUMN IF NOT EXISTS performance_level public.performance_level,
  ADD COLUMN IF NOT EXISTS competency_achieved BOOLEAN,
  ADD COLUMN IF NOT EXISTS teacher_comment TEXT,
  ADD COLUMN IF NOT EXISTS scores JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.assessments
  ALTER COLUMN activity_type SET DEFAULT 'summative_assessment'::public.activity_type,
  ALTER COLUMN performance_level SET DEFAULT 'ME'::public.performance_level,
  ALTER COLUMN competency_achieved SET DEFAULT false,
  ALTER COLUMN scores SET DEFAULT '[]'::jsonb;

-- =============================
-- HOI SUPPORT TABLES REQUIRED BY SRC USAGE
-- =============================
CREATE TABLE IF NOT EXISTS public.hoi_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hoi_classes
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'primary',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.hoi_classes
  DROP CONSTRAINT IF EXISTS hoi_classes_level_check;

ALTER TABLE public.hoi_classes
  ADD CONSTRAINT hoi_classes_level_check
  CHECK (level IN ('ecde', 'primary', 'junior_secondary'));

CREATE TABLE IF NOT EXISTS public.hoi_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hoi_subjects
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS public.hoi_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  employee_id TEXT,
  subject_specialization TEXT,
  gender TEXT,
  qualification TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  hired_at DATE,
  is_class_teacher BOOLEAN DEFAULT false,
  class_teacher_class_id UUID,
  class_teacher_class_name TEXT,
  class_teacher_stream_id UUID,
  class_teacher_stream_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hoi_teachers
  ADD COLUMN IF NOT EXISTS school_id UUID,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS employee_id TEXT,
  ADD COLUMN IF NOT EXISTS subject_specialization TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS qualification TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS hired_at DATE,
  ADD COLUMN IF NOT EXISTS is_class_teacher BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS class_teacher_class_id UUID,
  ADD COLUMN IF NOT EXISTS class_teacher_class_name TEXT,
  ADD COLUMN IF NOT EXISTS class_teacher_stream_id UUID,
  ADD COLUMN IF NOT EXISTS class_teacher_stream_name TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.hoi_teachers
  DROP CONSTRAINT IF EXISTS hoi_teachers_status_check;

ALTER TABLE public.hoi_teachers
  ADD CONSTRAINT hoi_teachers_status_check
  CHECK (status IN ('active', 'on_leave', 'deactivated'));

ALTER TABLE public.hoi_teachers
  DROP CONSTRAINT IF EXISTS hoi_teachers_gender_check;

ALTER TABLE public.hoi_teachers
  ADD CONSTRAINT hoi_teachers_gender_check
  CHECK (gender IS NULL OR gender IN ('Male', 'Female'));

CREATE TABLE IF NOT EXISTS public.hoi_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID,
  name TEXT NOT NULL,
  class_teacher_id UUID,
  class_teacher_name TEXT,
  student_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hoi_streams
  ADD COLUMN IF NOT EXISTS class_id UUID,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS class_teacher_id UUID,
  ADD COLUMN IF NOT EXISTS class_teacher_name TEXT,
  ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS public.hoi_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID,
  full_name TEXT NOT NULL,
  admission_no TEXT NOT NULL,
  upi TEXT,
  class_id UUID,
  class_name TEXT,
  stream_id UUID,
  stream_name TEXT,
  gender TEXT,
  date_of_birth DATE,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  enrolled_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hoi_students
  ADD COLUMN IF NOT EXISTS school_id UUID,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS admission_no TEXT,
  ADD COLUMN IF NOT EXISTS upi TEXT,
  ADD COLUMN IF NOT EXISTS class_id UUID,
  ADD COLUMN IF NOT EXISTS class_name TEXT,
  ADD COLUMN IF NOT EXISTS stream_id UUID,
  ADD COLUMN IF NOT EXISTS stream_name TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS guardian_name TEXT,
  ADD COLUMN IF NOT EXISTS guardian_phone TEXT,
  ADD COLUMN IF NOT EXISTS guardian_email TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS enrolled_at DATE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.hoi_students
  DROP CONSTRAINT IF EXISTS hoi_students_status_check;

ALTER TABLE public.hoi_students
  ADD CONSTRAINT hoi_students_status_check
  CHECK (status IN ('active', 'transferred', 'graduated'));

ALTER TABLE public.hoi_students
  DROP CONSTRAINT IF EXISTS hoi_students_gender_check;

ALTER TABLE public.hoi_students
  ADD CONSTRAINT hoi_students_gender_check
  CHECK (gender IS NULL OR gender IN ('Male', 'Female'));

CREATE TABLE IF NOT EXISTS public.hoi_subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID,
  teacher_id UUID,
  teacher_name TEXT,
  subject_id UUID,
  subject_name TEXT,
  class_id UUID,
  class_name TEXT,
  stream_id UUID,
  stream_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hoi_subject_assignments
  ADD COLUMN IF NOT EXISTS school_id UUID,
  ADD COLUMN IF NOT EXISTS teacher_id UUID,
  ADD COLUMN IF NOT EXISTS teacher_name TEXT,
  ADD COLUMN IF NOT EXISTS subject_id UUID,
  ADD COLUMN IF NOT EXISTS subject_name TEXT,
  ADD COLUMN IF NOT EXISTS class_id UUID,
  ADD COLUMN IF NOT EXISTS class_name TEXT,
  ADD COLUMN IF NOT EXISTS stream_id UUID,
  ADD COLUMN IF NOT EXISTS stream_name TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- =============================
-- FK ALIGNMENT (IDEMPOTENT)
-- =============================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_school_id_fkey') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_school_id_fkey
      FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_teachers_school_id_fkey') THEN
    ALTER TABLE public.hoi_teachers
      ADD CONSTRAINT hoi_teachers_school_id_fkey
      FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_students_school_id_fkey') THEN
    ALTER TABLE public.hoi_students
      ADD CONSTRAINT hoi_students_school_id_fkey
      FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_streams_class_id_fkey') THEN
    ALTER TABLE public.hoi_streams
      ADD CONSTRAINT hoi_streams_class_id_fkey
      FOREIGN KEY (class_id) REFERENCES public.hoi_classes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_streams_class_teacher_id_fkey') THEN
    ALTER TABLE public.hoi_streams
      ADD CONSTRAINT hoi_streams_class_teacher_id_fkey
      FOREIGN KEY (class_teacher_id) REFERENCES public.hoi_teachers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_teachers_class_teacher_class_id_fkey') THEN
    ALTER TABLE public.hoi_teachers
      ADD CONSTRAINT hoi_teachers_class_teacher_class_id_fkey
      FOREIGN KEY (class_teacher_class_id) REFERENCES public.hoi_classes(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_teachers_class_teacher_stream_id_fkey') THEN
    ALTER TABLE public.hoi_teachers
      ADD CONSTRAINT hoi_teachers_class_teacher_stream_id_fkey
      FOREIGN KEY (class_teacher_stream_id) REFERENCES public.hoi_streams(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_students_class_id_fkey') THEN
    ALTER TABLE public.hoi_students
      ADD CONSTRAINT hoi_students_class_id_fkey
      FOREIGN KEY (class_id) REFERENCES public.hoi_classes(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_students_stream_id_fkey') THEN
    ALTER TABLE public.hoi_students
      ADD CONSTRAINT hoi_students_stream_id_fkey
      FOREIGN KEY (stream_id) REFERENCES public.hoi_streams(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_subject_assignments_school_id_fkey') THEN
    ALTER TABLE public.hoi_subject_assignments
      ADD CONSTRAINT hoi_subject_assignments_school_id_fkey
      FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_subject_assignments_teacher_id_fkey') THEN
    ALTER TABLE public.hoi_subject_assignments
      ADD CONSTRAINT hoi_subject_assignments_teacher_id_fkey
      FOREIGN KEY (teacher_id) REFERENCES public.hoi_teachers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_subject_assignments_subject_id_fkey') THEN
    ALTER TABLE public.hoi_subject_assignments
      ADD CONSTRAINT hoi_subject_assignments_subject_id_fkey
      FOREIGN KEY (subject_id) REFERENCES public.hoi_subjects(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_subject_assignments_class_id_fkey') THEN
    ALTER TABLE public.hoi_subject_assignments
      ADD CONSTRAINT hoi_subject_assignments_class_id_fkey
      FOREIGN KEY (class_id) REFERENCES public.hoi_classes(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hoi_subject_assignments_stream_id_fkey') THEN
    ALTER TABLE public.hoi_subject_assignments
      ADD CONSTRAINT hoi_subject_assignments_stream_id_fkey
      FOREIGN KEY (stream_id) REFERENCES public.hoi_streams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================
-- INDEXES
-- =============================
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles (school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_schools_school_code ON public.schools (school_code);

CREATE INDEX IF NOT EXISTS idx_assessments_teacher_id ON public.assessments (teacher_id);
CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON public.assessments (student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_term ON public.assessments (term);

CREATE INDEX IF NOT EXISTS idx_hoi_streams_class_id ON public.hoi_streams (class_id);
CREATE INDEX IF NOT EXISTS idx_hoi_teachers_email ON public.hoi_teachers (email);
CREATE INDEX IF NOT EXISTS idx_hoi_students_admission_no ON public.hoi_students (admission_no);
CREATE INDEX IF NOT EXISTS idx_hoi_students_class_stream ON public.hoi_students (class_id, stream_id);
CREATE INDEX IF NOT EXISTS idx_hoi_subject_assignments_school_id ON public.hoi_subject_assignments (school_id);
CREATE INDEX IF NOT EXISTS idx_hoi_subject_assignments_teacher_id ON public.hoi_subject_assignments (teacher_id);

-- =============================
-- RLS + POLICIES
-- =============================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hoi_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hoi_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hoi_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hoi_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hoi_subjects ENABLE ROW LEVEL SECURITY;

-- schools
DROP POLICY IF EXISTS "Admins can view all schools" ON public.schools;
CREATE POLICY "Admins can view all schools"
ON public.schools
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can insert schools" ON public.schools;
CREATE POLICY "Admins can insert schools"
ON public.schools
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update any school" ON public.schools;
CREATE POLICY "Admins can update any school"
ON public.schools
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete schools" ON public.schools;
CREATE POLICY "Admins can delete schools"
ON public.schools
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- assessments
DROP POLICY IF EXISTS "Authenticated can manage assessments" ON public.assessments;
CREATE POLICY "Authenticated can manage assessments"
ON public.assessments
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- hoi_streams
DROP POLICY IF EXISTS "Authenticated can manage hoi_streams" ON public.hoi_streams;
CREATE POLICY "Authenticated can manage hoi_streams"
ON public.hoi_streams
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- hoi_teachers
DROP POLICY IF EXISTS "Authenticated can manage hoi_teachers" ON public.hoi_teachers;
CREATE POLICY "Authenticated can manage hoi_teachers"
ON public.hoi_teachers
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- hoi_students
DROP POLICY IF EXISTS "Authenticated can manage hoi_students" ON public.hoi_students;
CREATE POLICY "Authenticated can manage hoi_students"
ON public.hoi_students
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- hoi_subject_assignments
DROP POLICY IF EXISTS "Authenticated can manage hoi_subject_assignments" ON public.hoi_subject_assignments;
CREATE POLICY "Authenticated can manage hoi_subject_assignments"
ON public.hoi_subject_assignments
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- hoi_subjects
DROP POLICY IF EXISTS "Authenticated can manage hoi_subjects" ON public.hoi_subjects;
CREATE POLICY "Authenticated can manage hoi_subjects"
ON public.hoi_subjects
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

COMMIT;
