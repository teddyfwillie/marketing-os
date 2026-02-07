import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardMetrics {
  totalContent: number;
  totalPosts: number;
  totalCampaigns: number;
  totalCompetitors: number;
  recentActivity: number;
}

export function useDashboardMetrics() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["dashboard-metrics", profile?.organization_id],
    queryFn: async (): Promise<DashboardMetrics> => {
      if (!profile?.organization_id) {
        return {
          totalContent: 0,
          totalPosts: 0,
          totalCampaigns: 0,
          totalCompetitors: 0,
          recentActivity: 0,
        };
      }

      const [content, posts, campaigns, competitors, activity] = await Promise.all([
        supabase
          .from("generated_content")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id),
        supabase
          .from("social_posts")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id),
        supabase
          .from("email_campaigns")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id),
        supabase
          .from("competitors")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id),
        supabase
          .from("activity_log")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      return {
        totalContent: content.count || 0,
        totalPosts: posts.count || 0,
        totalCampaigns: campaigns.count || 0,
        totalCompetitors: competitors.count || 0,
        recentActivity: activity.count || 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}
