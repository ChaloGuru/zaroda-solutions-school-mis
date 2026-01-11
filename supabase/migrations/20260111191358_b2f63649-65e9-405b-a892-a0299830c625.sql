-- 1. Allow admins to view ALL schools (not just their own)
DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;

CREATE POLICY "Admins can view all schools" 
ON public.schools 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR id IN (SELECT school_id FROM profiles WHERE user_id = auth.uid())
);

-- 2. Allow admins to update any school
CREATE POLICY "Admins can update any school" 
ON public.schools 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Allow admins to delete schools
CREATE POLICY "Admins can delete schools" 
ON public.schools 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Add status column to schools for approval workflow
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended'));