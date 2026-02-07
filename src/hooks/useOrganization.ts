import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useOrganization() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["organization", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", profile.organization_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}
