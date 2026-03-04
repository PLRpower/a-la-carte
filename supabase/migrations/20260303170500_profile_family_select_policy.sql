-- Add policy to allow viewing profiles of family members
CREATE POLICY "Users can view family members profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING ( public.is_in_same_family(id) );
