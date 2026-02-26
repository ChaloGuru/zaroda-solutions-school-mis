ALTER TABLE public.schools
ALTER COLUMN school_type TYPE TEXT[]
USING (
  CASE
    WHEN school_type IS NULL OR btrim(school_type) = '' THEN ARRAY[]::TEXT[]
    WHEN position(',' IN school_type) > 0 THEN regexp_split_to_array(school_type, '\s*,\s*')
    ELSE ARRAY[school_type]
  END
);

ALTER TABLE public.schools
ALTER COLUMN school_type SET DEFAULT ARRAY[]::TEXT[];

UPDATE public.schools
SET school_type = ARRAY[]::TEXT[]
WHERE school_type IS NULL;

ALTER TABLE public.schools
DROP CONSTRAINT IF EXISTS schools_school_type_valid;

ALTER TABLE public.schools
ADD CONSTRAINT schools_school_type_valid
CHECK (school_type <@ ARRAY['ECDE', 'Primary', 'Junior Secondary']::TEXT[]);
