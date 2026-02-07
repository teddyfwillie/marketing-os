import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";
import { trackEvent } from "@/lib/analytics";

export function useAnalytics() {
  const { user, profile } = useAuth();

  const track = useCallback(
    async (eventName: string, properties?: Json) => {
      await trackEvent({
        eventName,
        properties,
        organizationId: profile?.organization_id ?? null,
        userId: user?.id ?? null,
      });
    },
    [profile?.organization_id, user?.id],
  );

  return { track };
}
