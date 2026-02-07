-- Referral and usage-credit system + product instrumentation events

CREATE TYPE public.referral_status AS ENUM ('pending', 'signed_up', 'qualified', 'rewarded', 'rejected');
CREATE TYPE public.usage_credit_reason AS ENUM ('referral_reward', 'usage_deduction', 'admin_adjustment');

CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id),
  CONSTRAINT referral_codes_code_len CHECK (char_length(code) >= 6)
);

CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.referral_status NOT NULL DEFAULT 'pending',
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referred_user_id),
  CONSTRAINT referrals_no_self_referral CHECK (referrer_user_id <> referred_user_id)
);

CREATE TABLE public.usage_credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  delta INTEGER NOT NULL,
  reason public.usage_credit_reason NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT usage_credit_non_zero_delta CHECK (delta <> 0)
);

CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  inviter_credit_delta INTEGER NOT NULL,
  invitee_credit_delta INTEGER NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referral_id)
);

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_usage_credit_ledger_user_created_at ON public.usage_credit_ledger(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_org_created_at ON public.analytics_events(organization_id, created_at DESC);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral code"
  ON public.referral_codes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own referral code"
  ON public.referral_codes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own referral relationships"
  ON public.referrals FOR SELECT
  USING (referrer_user_id = auth.uid() OR referred_user_id = auth.uid());

CREATE POLICY "Users can read own credit ledger"
  ON public.usage_credit_ledger FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can read own referral rewards"
  ON public.referral_rewards FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.referrals r
      WHERE r.id = referral_id
        AND (r.referrer_user_id = auth.uid() OR r.referred_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can read analytics events in their org"
  ON public.analytics_events FOR SELECT
  USING (
    user_id = auth.uid()
    OR organization_id = public.get_user_org_id(auth.uid())
  );

CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      organization_id IS NULL
      OR organization_id = public.get_user_org_id(auth.uid())
    )
  );

CREATE OR REPLACE FUNCTION public.get_or_create_referral_code()
RETURNS public.referral_codes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _org_id UUID;
  _existing public.referral_codes;
  _generated_code TEXT;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT *
  INTO _existing
  FROM public.referral_codes
  WHERE user_id = _uid
  LIMIT 1;

  IF _existing.id IS NOT NULL THEN
    RETURN _existing;
  END IF;

  SELECT organization_id INTO _org_id
  FROM public.profiles
  WHERE user_id = _uid
  LIMIT 1;

  LOOP
    _generated_code := upper(substr(md5(random()::text || clock_timestamp()::text || _uid::text), 1, 8));

    INSERT INTO public.referral_codes (user_id, organization_id, code)
    VALUES (_uid, _org_id, _generated_code)
    ON CONFLICT (code) DO NOTHING
    RETURNING * INTO _existing;

    EXIT WHEN _existing.id IS NOT NULL;
  END LOOP;

  RETURN _existing;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_referral_reward(p_referral_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ref public.referrals;
  _invitee_onboarded BOOLEAN := false;
  _inviter_org UUID;
  _invitee_org UUID;
BEGIN
  SELECT *
  INTO _ref
  FROM public.referrals
  WHERE id = p_referral_id
  LIMIT 1;

  IF _ref.id IS NULL THEN
    RAISE EXCEPTION 'Referral not found';
  END IF;

  SELECT onboarding_completed, organization_id
  INTO _invitee_onboarded, _invitee_org
  FROM public.profiles
  WHERE user_id = _ref.referred_user_id
  LIMIT 1;

  IF NOT COALESCE(_invitee_onboarded, false) THEN
    UPDATE public.referrals
    SET status = 'signed_up', updated_at = now()
    WHERE id = _ref.id;
    RETURN false;
  END IF;

  IF EXISTS (SELECT 1 FROM public.referral_rewards rr WHERE rr.referral_id = _ref.id) THEN
    UPDATE public.referrals
    SET status = 'rewarded', updated_at = now()
    WHERE id = _ref.id;
    RETURN false;
  END IF;

  SELECT organization_id
  INTO _inviter_org
  FROM public.profiles
  WHERE user_id = _ref.referrer_user_id
  LIMIT 1;

  INSERT INTO public.usage_credit_ledger (user_id, organization_id, delta, reason, reference_id)
  VALUES
    (_ref.referrer_user_id, _inviter_org, 50, 'referral_reward', _ref.id),
    (_ref.referred_user_id, _invitee_org, 25, 'referral_reward', _ref.id);

  INSERT INTO public.referral_rewards (referral_id, inviter_credit_delta, invitee_credit_delta)
  VALUES (_ref.id, 50, 25);

  UPDATE public.referrals
  SET status = 'rewarded', updated_at = now()
  WHERE id = _ref.id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_referral(p_code TEXT, p_source TEXT DEFAULT 'direct')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _normalized_code TEXT := upper(trim(p_code));
  _ref_code public.referral_codes;
  _existing_referral public.referrals;
  _new_referral_id UUID;
  _onboarding_complete BOOLEAN := false;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _normalized_code IS NULL OR _normalized_code = '' THEN
    RAISE EXCEPTION 'Referral code is required';
  END IF;

  SELECT *
  INTO _ref_code
  FROM public.referral_codes
  WHERE code = _normalized_code
    AND is_active = true
  LIMIT 1;

  IF _ref_code.id IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;

  IF _ref_code.user_id = _uid THEN
    RAISE EXCEPTION 'Self-referral is not allowed';
  END IF;

  SELECT *
  INTO _existing_referral
  FROM public.referrals
  WHERE referred_user_id = _uid
  LIMIT 1;

  IF _existing_referral.id IS NOT NULL THEN
    IF _existing_referral.referrer_user_id <> _ref_code.user_id THEN
      RAISE EXCEPTION 'A referral is already attributed to this account';
    END IF;
    RETURN _existing_referral.id;
  END IF;

  SELECT onboarding_completed
  INTO _onboarding_complete
  FROM public.profiles
  WHERE user_id = _uid
  LIMIT 1;

  INSERT INTO public.referrals (
    referral_code_id,
    referrer_user_id,
    referred_user_id,
    status,
    source
  )
  VALUES (
    _ref_code.id,
    _ref_code.user_id,
    _uid,
    CASE WHEN COALESCE(_onboarding_complete, false) THEN 'qualified'::public.referral_status ELSE 'signed_up'::public.referral_status END,
    COALESCE(p_source, 'direct')
  )
  RETURNING id INTO _new_referral_id;

  PERFORM public.grant_referral_reward(_new_referral_id);

  RETURN _new_referral_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_usage_credit(
  p_reason public.usage_credit_reason DEFAULT 'usage_deduction',
  p_reference_id UUID DEFAULT NULL,
  p_amount INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _org_id UUID;
  _balance INTEGER := 0;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;

  SELECT COALESCE(SUM(delta), 0)
  INTO _balance
  FROM public.usage_credit_ledger
  WHERE user_id = _uid;

  IF _balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  SELECT organization_id INTO _org_id
  FROM public.profiles
  WHERE user_id = _uid
  LIMIT 1;

  INSERT INTO public.usage_credit_ledger (user_id, organization_id, delta, reason, reference_id)
  VALUES (_uid, _org_id, -p_amount, p_reason, p_reference_id);

  RETURN _balance - p_amount;
END;
$$;

CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
