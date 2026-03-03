-- Check duplicates first (per school + learning area name)
-- SELECT school_id, name, count(*)
-- FROM public.hoi_subjects
-- GROUP BY school_id, name
-- HAVING count(*) > 1
-- ORDER BY school_id, name;

-- Remove duplicates, keeping the earliest row by created_at then id.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY school_id, lower(trim(name))
      ORDER BY created_at NULLS LAST, id
    ) AS rn
  FROM public.hoi_subjects
)
DELETE FROM public.hoi_subjects hs
USING ranked r
WHERE hs.id = r.id
  AND r.rn > 1;

-- Normalize legacy categories to CBC categories used by the app.
UPDATE public.hoi_subjects
SET category = CASE
  WHEN lower(trim(name)) IN (
    'language activities',
    'mathematical activities',
    'environmental activities',
    'psychomotor & creative activities',
    'religious education (cre/ire)'
  ) THEN 'ECDE'
  WHEN lower(trim(name)) IN (
    'english',
    'kiswahili / ksl',
    'indigenous language',
    'mathematics',
    'environmental activities',
    'religious education (cre/ire)',
    'creative arts',
    'physical & health education'
  ) AND category NOT IN ('Upper Primary', 'Junior School') THEN 'Lower Primary'
  WHEN lower(trim(name)) IN (
    'science & technology',
    'social studies',
    'agriculture'
  ) AND category IN ('STEM', 'Arts and Sports', 'Arts & Sports', 'Upper Primary') THEN 'Upper Primary'
  WHEN category IN ('Junior Secondary') THEN 'Junior School'
  ELSE category
END
WHERE category IN ('STEM', 'Arts and Sports', 'Arts & Sports', 'Junior Secondary', 'Upper Primary', 'Lower Primary', 'ECDE', 'Junior School');

-- Prevent future duplicates of the same learning area name within a school.
CREATE UNIQUE INDEX IF NOT EXISTS ux_hoi_subjects_school_name_ci
ON public.hoi_subjects (school_id, lower(trim(name)));
