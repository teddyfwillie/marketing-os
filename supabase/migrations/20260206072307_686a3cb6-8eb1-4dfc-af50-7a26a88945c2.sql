-- Add created_by so the creator can read the org immediately after insert
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE INDEX IF NOT EXISTS idx_organizations_created_by
ON public.organizations (created_by);

-- Rework RLS policies to allow creator visibility and prevent spoofing
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON public.organizations;

CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND created_by = auth.uid()
);

CREATE POLICY "Users can view their organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  user_belongs_to_org(auth.uid(), id)
  OR created_by = auth.uid()
);

CREATE POLICY "Users can update their organization"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  user_belongs_to_org(auth.uid(), id)
  OR created_by = auth.uid()
);
