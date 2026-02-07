# Marketing OS Redesign + Referral Growth Engine Plan

## Summary
Redesign the full product with a bold editorial visual system, consistent motion, and page-specific UX upgrades, then add a referral program with usage-credit rewards to drive user acquisition.  
Rollout will be phased: system foundations first, then page migrations, then referral launch and optimization.

## Product Goals
- Make every page feel intentional, premium, and non-generic.
- Improve usability and flow continuity across desktop/mobile.
- Add one built-in growth loop that increases signups from existing users.
- Track measurable outcomes for design quality and growth conversion.

## Success Criteria
- Design quality: all routed pages use the new design system primitives and motion rules.
- UX smoothness: no abrupt layout jumps; loading/error/empty states are defined on every page.
- Growth: referral funnel metrics exist end-to-end (invite sent, signup, reward granted).
- Business: target +15% signup volume from referral channel within 30 days of rollout.

## Scope
- In scope: `Auth`, `Onboarding`, `Dashboard`, `Content Creator`, `Social Media`, `Email Campaigns`, `Competitors`, `Analytics`, `Settings`, `NotFound`, shared `Header`, shared `Sidebar`, global theme/tokens.
- In scope: new referral data model, UI, tracking, and reward application.
- Out of scope (phase 1): external billing-provider rewards, paid-plan entitlements, native mobile app parity.

## Information Architecture & UX Foundation
1. Establish a single visual language:
- Replace generic card-grid sameness with alternating “hero + utility rail + dense data” compositions.
- Create stronger hierarchy using expressive display headings + compact body typography.
- Define semantic surface tiers (`surface-1`, `surface-2`, `surface-glass`) and consistent elevation rules.
- Introduce a non-flat backdrop system (subtle mesh/gradient + noise texture) across authenticated pages.

2. Design tokens and component contracts:
- Expand `index.css` tokens with spacing scale, radius scale, elevation scale, and motion durations.
- Add component variants for `PageHero`, `StatTile`, `Panel`, `ActionStrip`, `EmptyState`, `SectionHeader`.
- Standardize skeleton/loading variants and status badges across modules.

3. Smooth interface behavior standards:
- Page entry transition: 180–240ms fade/slide with stagger on section blocks.
- Interaction transitions: 120–160ms for hover/focus/press and panel open/close.
- Consistent async handling: optimistic UI where safe, skeletons on data fetch, inline retry on failures.
- Preserve reduced-motion accessibility path.

## Page-by-Page Redesign Spec

### Auth
- Split layout: branded narrative side + auth form side.
- Add trust band (social proof, value bullets) without crowding primary CTA.
- Upgrade form rhythm, field feedback, and password visibility affordances.
- Add referral capture entry point (“Have an invite code?”) to tie into growth loop.

### Onboarding
- Convert into guided setup flow with progress rail and “time to complete” indicator.
- Add contextual previews (how inputs personalize dashboard/content suggestions).
- If invite code exists, auto-apply and confirm pending reward state.
- Tight success handoff into redesigned dashboard first-run state.

### Dashboard
- Replace static-feeling overview with “command center”:
- Top: strategic hero (weekly outcomes + key CTA).
- Mid: modular performance blocks with mixed layouts (not uniform cards).
- Right rail: tasks/activity/feed with stronger priority cues.
- Add referral snapshot widget (invites sent, conversions, credits earned).

### Content Creator
- Split into ideation workspace + live output preview.
- Add template chips, prompt assistant presets, and better save/schedule pathways.
- Improve saved-content browsing with filters, pins, and quick actions.
- Add “Create shareable teaser” action that links content value to referral CTA.

### Social Media
- Rework into calendar-first workflow with platform-aware constraints.
- Add post quality hints (length/clarity/CTA checks).
- Improve multi-platform status visibility with timeline cards.
- Add quick share of referral link for social copy generation.

### Email Campaigns
- Shift to campaign pipeline view (draft/scheduled/active/completed lanes).
- Add subject preview + preflight checklist panel before send/schedule.
- Improve performance tiles with historical comparison deltas.
- Add referral block snippet insertion into email templates.

### Competitors
- Elevate analysis readability with insight cards, trend deltas, and content opportunity list.
- Add scan freshness indicators and richer status semantics.
- Keep destructive actions safer with stronger affordances and confirmations.
- Add “turn competitor gap into referral-friendly template” CTA.

### Analytics
- Move from raw counts to story-based analytics sections (acquisition, engagement, execution).
- Add dedicated referral acquisition section (channel breakdown, conversion, reward cost per signup).
- Improve chart readability, legends, and timeframe control behavior.
- Introduce anomaly callouts for quick decision-making.

### Settings
- Reorganize into profile, workspace, notifications, integrations, billing, and growth tabs.
- Add new “Referrals” tab with invite link management, status table, reward history.
- Improve settings state persistence feedback and section-level save indicators.

### NotFound
- Brand-aligned recovery page with contextual navigation shortcuts and recent destinations.

## New Growth Functionality: Referral Program (Usage Credits)

## Referral User Journey
1. User opens `Settings > Referrals`.
2. User copies or shares personal referral URL/code.
3. Invitee signs up with code or auto-attributed URL param.
4. On invitee onboarding completion, referral is marked converted.
5. Usage credits are granted to inviter + invitee.
6. Credits are visible in dashboard and deducted when creating content/posts/campaigns.

## Data Model Changes (Supabase)
- `referral_codes`
- `id`, `user_id`, `organization_id`, `code` (unique), `is_active`, timestamps.
- `referrals`
- `id`, `referral_code_id`, `referrer_user_id`, `referred_user_id`, `status` (`pending|signed_up|qualified|rewarded|rejected`), `source`, timestamps.
- `usage_credit_ledger`
- `id`, `user_id`, `organization_id`, `delta`, `reason` (`referral_reward|usage_deduction|admin_adjustment`), `reference_id`, timestamps.
- `referral_rewards`
- `id`, `referral_id`, `inviter_credit_delta`, `invitee_credit_delta`, `granted_at`.

## Public APIs / Interfaces / Types
- New TS types in `src/integrations/supabase/types.ts` for all new tables and enums.
- New hooks:
- `useReferralCode`, `useReferrals`, `useClaimReferral`, `useCreditBalance`, `useCreditLedger`.
- New edge function or RPC:
- `claim_referral(code, source)` to validate code, prevent self-referral, create/advance referral state.
- New server-side reward function:
- `grant_referral_reward(referral_id)` transactional credit writes + idempotency check.
- Route/API contract updates:
- Accept optional `ref` query param on `/auth` and `/onboarding`.
- Persist pending referral attribution until account is created.

## Security / RLS
- Referrers can read only their own code, referrals, and reward records.
- Invitees can read only their own referral relationship.
- Reward writes restricted to service role/RPC definer functions.
- Add anti-abuse constraints:
- one rewardable referral per referred user.
- no self-referrals.
- optional same-domain/email heuristic checks.

## Implementation Phases

### Phase 1: Foundation
- Create new design tokens, typography scale, spacing/elevation/motion primitives.
- Build shared layout blocks (`PageHero`, `SectionHeader`, `Panel`, `EmptyState`, skeletons).
- Refactor `Header` and `Sidebar` to new navigation and visual rhythm.

### Phase 2: Core Page Redesign
- Migrate `Dashboard`, `Content Creator`, `Social Media`, `Email Campaigns`.
- Ensure all module pages adopt shared patterns and animation rules.
- Add standardized loading/error/empty state components everywhere.

### Phase 3: Remaining Pages + Auth Flow
- Redesign `Competitors`, `Analytics`, `Settings`, `Auth`, `Onboarding`, `NotFound`.
- Introduce first-run flows and contextual onboarding cues.

### Phase 4: Referral Backend + Frontend
- Add Supabase migrations, RLS policies, RPC/functions, and hooks.
- Build referral settings tab, dashboard widget, and auth/onboarding attribution.
- Add credit balance display and consumption logic in create actions.

### Phase 5: Instrumentation + Optimization
- Add analytics events for referral funnel and key redesigned interactions.
- Run funnel analysis and tune copy/layout for referral conversion.

## Testing & Validation

## Functional Tests
- Referral code generation uniqueness.
- Referral attribution from URL param through signup/onboarding.
- Reward grant idempotency and abuse prevention.
- Credit ledger balance correctness under concurrent mutations.

## UI/UX Tests
- Per-page snapshot/regression tests for layout and states.
- Interaction tests for navigation, transitions, modals, and async feedback.
- Mobile breakpoint checks for all routed pages.

## Integration/E2E Scenarios
- New user signs up via referral, completes onboarding, both parties receive credits.
- Referrer sees updated referral status + balance in settings/dashboard.
- Content creation deducts credits and blocks gracefully when insufficient.

## Performance & Accessibility
- Lighthouse budgets for layout shift and interaction responsiveness.
- Keyboard navigation and focus ring consistency in new components.
- Reduced-motion compliance and color contrast verification.

## Assumptions and Defaults Chosen
- Visual direction: **Bold Editorial**.
- Rollout strategy: **Phased Rollout**.
- Growth feature: **Referral Program**.
- Reward model: **Usage Credits for inviter + invitee after qualified signup/onboarding completion**.
- Qualification default: invitee must complete onboarding to trigger reward.
- Initial reward value default: +50 credits inviter, +25 credits invitee (configurable constant).
