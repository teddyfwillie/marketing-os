import { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export async function trackEvent(params: {
  eventName: string;
  properties?: Json;
  organizationId?: string | null;
  userId?: string | null;
}): Promise<void> {
  const { eventName, properties = null, organizationId = null, userId = null } = params;

  const { error } = await supabase.from("analytics_events").insert({
    event_name: eventName,
    properties,
    organization_id: organizationId,
    user_id: userId,
  });

  if (error) {
    console.warn("Failed to track event", { eventName, error });
  }
}
