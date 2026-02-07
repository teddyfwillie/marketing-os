import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

export function useEmailCampaigns() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["email-campaigns", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateEmailCampaign() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      name,
      subject,
      content,
      audience,
      scheduledAt,
      status = "draft",
    }: {
      name: string;
      subject?: string;
      content?: string;
      audience?: string;
      scheduledAt?: string;
      status?: "draft" | "scheduled" | "active" | "completed";
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase
        .from("email_campaigns")
        .insert({
          organization_id: profile.organization_id,
          created_by: user?.id,
          name,
          subject,
          content,
          audience: audience || "all",
          scheduled_at: scheduledAt || null,
          status,
        })
        .select()
        .single();

      if (error) throw error;

      const { error: creditError } = await supabase.rpc("consume_usage_credit", {
        p_reason: "usage_deduction",
        p_reference_id: data.id,
        p_amount: 1,
      });
      if (creditError) {
        await supabase.from("email_campaigns").delete().eq("id", data.id);
        throw creditError;
      }

      await supabase.from("activity_log").insert({
        organization_id: profile.organization_id,
        user_id: user?.id,
        activity_type: "email",
        title: "Email campaign created",
        description: `Created campaign "${name}"`,
      });

      await trackEvent({
        eventName: "email_campaign_created",
        organizationId: profile.organization_id,
        userId: user?.id,
        properties: { status, audience: audience || "all" },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast({ title: "Campaign created", description: "Your email campaign has been saved." });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create campaign",
        description: error.message.includes("Insufficient credits") ? "Insufficient credits. Earn more through referrals." : error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEmailCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      subject?: string;
      content?: string;
      audience?: string;
      scheduled_at?: string | null;
      status?: "draft" | "scheduled" | "active" | "completed";
      open_rate?: number;
      click_rate?: number;
    }) => {
      const { data, error } = await supabase
        .from("email_campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast({ title: "Campaign updated" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteEmailCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from("email_campaigns")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
      toast({ title: "Campaign deleted" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
