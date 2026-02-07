-- Fix onboarding: allow org creator to insert their own admin role

-- Ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow the organization creator to self-assign 'admin' for the org they created
DROP POLICY IF EXISTS "Org creators can self-assign admin" ON public.user_roles;

CREATE POLICY "Org creators can self-assign admin"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'admin'::app_role
  AND EXISTS (
    SELECT 1
    FROM public.organizations o
    WHERE o.id = organization_id
      AND o.created_by = auth.uid()
  )
);
