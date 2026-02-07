import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useReferralCode() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referral-code", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_or_create_referral_code");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useReferrals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          sent: [],
          received: null,
          summary: {
            sent: 0,
            converted: 0,
            rewarded: 0,
          },
        };
      }

      const [{ data: sent, error: sentError }, { data: received, error: receivedError }] = await Promise.all([
        supabase.from("referrals").select("*").eq("referrer_user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("referrals").select("*").eq("referred_user_id", user.id).maybeSingle(),
      ]);

      if (sentError) throw sentError;
      if (receivedError) throw receivedError;

      const converted = (sent || []).filter((item) => ["qualified", "rewarded"].includes(item.status)).length;
      const rewarded = (sent || []).filter((item) => item.status === "rewarded").length;

      return {
        sent: sent || [],
        received,
        summary: {
          sent: sent?.length || 0,
          converted,
          rewarded,
        },
      };
    },
    enabled: !!user,
  });
}

export function useClaimReferral() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ code, source }: { code: string; source?: string }) => {
      const { data, error } = await supabase.rpc("claim_referral", {
        p_code: code,
        p_source: source || "manual",
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      queryClient.invalidateQueries({ queryKey: ["credit-balance"] });
      queryClient.invalidateQueries({ queryKey: ["credit-ledger"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-data"] });
      toast({ title: "Referral applied", description: "Invite attribution was successfully saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Referral claim failed", description: error.message, variant: "destructive" });
    },
  });
}

export function useCreditBalance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["credit-balance", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data, error } = await supabase.from("usage_credit_ledger").select("delta").eq("user_id", user.id);
      if (error) throw error;

      return (data || []).reduce((sum, item) => sum + item.delta, 0);
    },
    enabled: !!user,
  });
}

export function useCreditLedger() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["credit-ledger", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("usage_credit_ledger")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
