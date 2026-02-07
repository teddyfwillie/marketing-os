-- Storage policies for social image uploads and guaranteed credit-ledger bootstrap per user.

-- Allow zero-delta bootstrap entries so every user can have a ledger row.
ALTER TABLE public.usage_credit_ledger
  DROP CONSTRAINT IF EXISTS usage_credit_non_zero_delta;

-- Ensure a ledger row exists for a given user.
CREATE OR REPLACE FUNCTION public.ensure_credit_ledger_row(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.usage_credit_ledger
    WHERE user_id = p_user_id
  ) THEN
    RETURN;
  END IF;

  SELECT organization_id
  INTO _org_id
  FROM public.profiles
  WHERE user_id = p_user_id
  LIMIT 1;

  INSERT INTO public.usage_credit_ledger (user_id, organization_id, delta, reason, reference_id)
  VALUES (p_user_id, _org_id, 0, 'admin_adjustment', NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_credit_ledger_row_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_credit_ledger_row(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_credit_ledger_row_on_profile_insert ON public.profiles;

CREATE TRIGGER create_credit_ledger_row_on_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_credit_ledger_row_from_profile();

-- Backfill ledger row for all existing users.
INSERT INTO public.usage_credit_ledger (user_id, organization_id, delta, reason, reference_id)
SELECT
  u.id,
  p.organization_id,
  0,
  'admin_adjustment'::public.usage_credit_reason,
  NULL
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE NOT EXISTS (
  SELECT 1
  FROM public.usage_credit_ledger l
  WHERE l.user_id = u.id
);

-- Storage policies for bucket `teddy`.
DROP POLICY IF EXISTS "Users can upload teddy images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own teddy images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own teddy images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own teddy images" ON storage.objects;

CREATE POLICY "Users can upload teddy images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teddy'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own teddy images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'teddy'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own teddy images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teddy'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'teddy'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own teddy images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'teddy'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
