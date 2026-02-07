import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

export function useGeneratedContent() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["generated-content", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("generated_content")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      contentType,
      tone,
      prompt,
      content,
      title,
    }: {
      contentType: "blog" | "social" | "ad" | "email";
      tone: "professional" | "casual" | "friendly" | "persuasive";
      prompt?: string;
      content: string;
      title?: string;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase
        .from("generated_content")
        .insert({
          organization_id: profile.organization_id,
          created_by: user?.id,
          content_type: contentType,
          tone,
          prompt,
          content,
          title,
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
        await supabase.from("generated_content").delete().eq("id", data.id);
        throw creditError;
      }

      // Log activity
      await supabase.from("activity_log").insert({
        organization_id: profile.organization_id,
        user_id: user?.id,
        activity_type: "content",
        title: "Content generated",
        description: `Created ${contentType} content: "${title || prompt?.substring(0, 50)}"`,
      });
      await trackEvent({
        eventName: "content_created",
        organizationId: profile.organization_id,
        userId: user?.id,
        properties: { content_type: contentType },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-content"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast({ title: "Content saved", description: "Your content has been saved." });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save content",
        description: error.message.includes("Insufficient credits") ? "Insufficient credits. Earn more through referrals." : error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      content,
      title,
    }: {
      id: string;
      content?: string;
      title?: string;
    }) => {
      const { data, error } = await supabase
        .from("generated_content")
        .update({ content, title })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-content"] });
      toast({ title: "Content updated" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update content",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const { error } = await supabase
        .from("generated_content")
        .delete()
        .eq("id", contentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-content"] });
      toast({ title: "Content deleted" });
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
