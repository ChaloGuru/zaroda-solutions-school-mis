-- 1. Fix user_roles INSERT policy - prevent direct inserts
CREATE POLICY "Prevent direct role inserts" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (false);

-- 2. Restrict sports_participants SELECT to admins/teachers only (protect DOB and personal info)
DROP POLICY IF EXISTS "Users can view participants for their school" ON public.sports_participants;

CREATE POLICY "School admins and teachers can view participants" 
ON public.sports_participants 
FOR SELECT 
TO authenticated
USING (
  school_id IN (
    SELECT p.school_id FROM profiles p WHERE p.user_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'school_admin') 
    OR public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'admin')
  )
);