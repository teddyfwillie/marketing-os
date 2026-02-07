import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { trackEvent } from "@/lib/analytics";

type PlatformType = Database["public"]["Enums"]["social_platform"];
type PostStatus = Database["public"]["Enums"]["post_status"];
const SOCIAL_MEDIA_BUCKET = "teddy";

const sanitizeFileName = (fileName: string) => fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

const removeUploadedFiles = async (paths: string[]) => {
  if (!paths.length) return;
  await supabase.storage.from(SOCIAL_MEDIA_BUCKET).remove(paths);
};

export function useSocialPosts() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["social-posts", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateSocialPost() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      content,
      platforms,
      scheduledAt,
      status = "draft",
      mediaFiles = [],
    }: {
      content: string;
      platforms: PlatformType[];
      scheduledAt?: string;
      status?: PostStatus;
      mediaFiles?: File[];
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");
      if (!user?.id) throw new Error("No authenticated user");

      const uploadedPaths: string[] = [];
      const mediaUrls: string[] = [];

      for (const file of mediaFiles) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`Unsupported file type for ${file.name}. Please upload images only.`);
        }

        const filePath = `social-posts/${user.id}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from(SOCIAL_MEDIA_BUCKET)
          .upload(filePath, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          await removeUploadedFiles(uploadedPaths);
          throw uploadError;
        }

        uploadedPaths.push(filePath);
        const { data: publicUrlData } = supabase.storage.from(SOCIAL_MEDIA_BUCKET).getPublicUrl(filePath);
        mediaUrls.push(publicUrlData.publicUrl);
      }

      const { data, error } = await supabase
        .from("social_posts")
        .insert({
          organization_id: profile.organization_id,
          created_by: user?.id,
          content,
          platforms,
          scheduled_at: scheduledAt || null,
          status,
          media_urls: mediaUrls.length ? mediaUrls : null,
        })
        .select()
        .single();

      if (error) {
        await removeUploadedFiles(uploadedPaths);
        throw error;
      }

      const { error: creditError } = await supabase.rpc("consume_usage_credit", {
        p_reason: "usage_deduction",
        p_reference_id: data.id,
        p_amount: 1,
      });
      if (creditError) {
        await supabase.from("social_posts").delete().eq("id", data.id);
        await removeUploadedFiles(uploadedPaths);
        throw creditError;
      }

      await supabase.from("activity_log").insert({
        organization_id: profile.organization_id,
        user_id: user?.id,
        activity_type: "social",
        title: "Social post created",
        description: `Created a ${status} social post`,
      });

      await trackEvent({
        eventName: "social_post_created",
        organizationId: profile.organization_id,
        userId: user?.id,
        properties: { status, platforms },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast({ title: "Post created", description: "Your social post has been saved." });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message.includes("Insufficient credits") ? "Insufficient credits. Earn more through referrals." : error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSocialPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      content,
      platforms,
      scheduled_at,
      status,
    }: {
      id: string;
      content?: string;
      platforms?: PlatformType[];
      scheduled_at?: string | null;
      status?: PostStatus;
    }) => {
      const updates: Record<string, unknown> = {};
      if (content !== undefined) updates.content = content;
      if (platforms !== undefined) updates.platforms = platforms;
      if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at;
      if (status !== undefined) updates.status = status;

      const { data, error } = await supabase
        .from("social_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      toast({ title: "Post updated" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteSocialPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("social_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      toast({ title: "Post deleted" });
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
