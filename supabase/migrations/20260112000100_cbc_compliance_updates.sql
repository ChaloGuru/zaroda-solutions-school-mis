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

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'class_level' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.class_level AS ENUM (
      'pp1',
      'pp2',
      'grade_1',
      'grade_2',
      'grade_3',
      'grade_4',
      'grade_5',
      'grade_6',
      'grade_7',
      'grade_8',
      'grade_9'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'assessments'
  ) THEN
    ALTER TABLE public.assessments
      ADD COLUMN IF NOT EXISTS activity_type public.activity_type,
      ADD COLUMN IF NOT EXISTS performance_level public.performance_level,
      ADD COLUMN IF NOT EXISTS competency_achieved boolean,
      ADD COLUMN IF NOT EXISTS teacher_comment text;

    UPDATE public.assessments
    SET performance_level = CASE
      WHEN UPPER(COALESCE(grade, '')) IN ('A', 'A+', 'A-') THEN 'EE'::public.performance_level
      WHEN UPPER(COALESCE(grade, '')) IN ('B', 'B+', 'B-', 'C', 'C+', 'C-') THEN 'ME'::public.performance_level
      WHEN UPPER(COALESCE(grade, '')) IN ('D', 'D+', 'D-') THEN 'AE'::public.performance_level
      WHEN UPPER(COALESCE(grade, '')) IN ('E') THEN 'BE'::public.performance_level
      ELSE performance_level
    END
    WHERE performance_level IS NULL;

    UPDATE public.assessments
    SET activity_type = 'summative_assessment'::public.activity_type
    WHERE activity_type IS NULL;

    ALTER TABLE public.assessments
      ALTER COLUMN activity_type SET DEFAULT 'summative_assessment'::public.activity_type,
      ALTER COLUMN performance_level SET DEFAULT 'ME'::public.performance_level,
      ALTER COLUMN competency_achieved SET DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assessments' AND column_name = 'class_name'
  ) THEN
    UPDATE public.assessments
    SET class_name = CASE
      WHEN class_name = 'Form 1' THEN 'Grade 7'
      WHEN class_name = 'Form 2' THEN 'Grade 8'
      WHEN class_name IN ('Form 3', 'Form 4') THEN 'Grade 9'
      ELSE class_name
    END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exam_results' AND column_name = 'class_name'
  ) THEN
    UPDATE public.exam_results
    SET class_name = CASE
      WHEN class_name = 'Form 1' THEN 'Grade 7'
      WHEN class_name = 'Form 2' THEN 'Grade 8'
      WHEN class_name IN ('Form 3', 'Form 4') THEN 'Grade 9'
      ELSE class_name
    END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sports_participants' AND column_name = 'grade'
  ) THEN
    UPDATE public.sports_participants
    SET grade = CASE
      WHEN grade = 'Form 1' THEN 'Grade 7'
      WHEN grade = 'Form 2' THEN 'Grade 8'
      WHEN grade IN ('Form 3', 'Form 4') THEN 'Grade 9'
      ELSE grade
    END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'election_candidates' AND column_name = 'grade'
  ) THEN
    UPDATE public.election_candidates
    SET grade = CASE
      WHEN grade = 'Form 1' THEN 'Grade 7'
      WHEN grade = 'Form 2' THEN 'Grade 8'
      WHEN grade IN ('Form 3', 'Form 4') THEN 'Grade 9'
      ELSE grade
    END;
  END IF;
END $$;