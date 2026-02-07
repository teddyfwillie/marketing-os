import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

type ContentType = Database["public"]["Enums"]["content_type"];
type PostStatus = Database["public"]["Enums"]["post_status"];
type CampaignStatus = Database["public"]["Enums"]["campaign_status"];

interface AnalyticsData {
  totals: {
    content: number;
    socialPosts: number;
    emailCampaigns: number;
    recentActivity: number;
    scheduledPosts: number;
    scheduledCampaigns: number;
    referralInvites: number;
    referralQualified: number;
    referralRewarded: number;
    referralEventCount: number;
  };
  contentByType: Record<ContentType, number>;
  socialByStatus: Record<PostStatus, number>;
  campaignsByStatus: Record<CampaignStatus, number>;
  referralsByStatus: Record<Database["public"]["Enums"]["referral_status"], number>;
}

const emptyData: AnalyticsData = {
  totals: {
    content: 0,
    socialPosts: 0,
    emailCampaigns: 0,
    recentActivity: 0,
    scheduledPosts: 0,
    scheduledCampaigns: 0,
    referralInvites: 0,
    referralQualified: 0,
    referralRewarded: 0,
    referralEventCount: 0,
  },
  contentByType: {
    blog: 0,
    social: 0,
    ad: 0,
    email: 0,
  },
  socialByStatus: {
    draft: 0,
    scheduled: 0,
    published: 0,
  },
  campaignsByStatus: {
    draft: 0,
    scheduled: 0,
    active: 0,
    paused: 0,
    completed: 0,
  },
  referralsByStatus: {
    pending: 0,
    signed_up: 0,
    qualified: 0,
    rewarded: 0,
    rejected: 0,
  },
};

export function useAnalyticsData() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["analytics-data", profile?.organization_id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!profile?.organization_id) {
        return emptyData;
      }

      const orgId = profile.organization_id;

      const [
        contentCount,
        socialCount,
        campaignCount,
        recentActivityCount,
        scheduledPostsCount,
        scheduledCampaignsCount,
        contentRows,
        socialRows,
        campaignRows,
        referralRows,
        referralEventCount,
      ] = await Promise.all([
        supabase
          .from("generated_content")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId),
        supabase
          .from("social_posts")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId),
        supabase
          .from("email_campaigns")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId),
        supabase
          .from("activity_log")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from("social_posts")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .eq("status", "scheduled"),
        supabase
          .from("email_campaigns")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .eq("status", "scheduled"),
        supabase
          .from("generated_content")
          .select("content_type")
          .eq("organization_id", orgId),
        supabase
          .from("social_posts")
          .select("status")
          .eq("organization_id", orgId),
        supabase
          .from("email_campaigns")
          .select("status")
          .eq("organization_id", orgId),
        supabase
          .from("referrals")
          .select("status")
          .eq("referrer_user_id", profile.user_id),
        supabase
          .from("analytics_events")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .like("event_name", "referral_%"),
      ]);

      if (contentRows.error) throw contentRows.error;
      if (socialRows.error) throw socialRows.error;
      if (campaignRows.error) throw campaignRows.error;
      if (contentCount.error) throw contentCount.error;
      if (socialCount.error) throw socialCount.error;
      if (campaignCount.error) throw campaignCount.error;
      if (recentActivityCount.error) throw recentActivityCount.error;
      if (scheduledPostsCount.error) throw scheduledPostsCount.error;
      if (scheduledCampaignsCount.error) throw scheduledCampaignsCount.error;
      if (referralRows.error) throw referralRows.error;
      if (referralEventCount.error) throw referralEventCount.error;

      const contentByType = { ...emptyData.contentByType };
      for (const row of contentRows.data || []) {
        contentByType[row.content_type] += 1;
      }

      const socialByStatus = { ...emptyData.socialByStatus };
      for (const row of socialRows.data || []) {
        socialByStatus[row.status] += 1;
      }

      const campaignsByStatus = { ...emptyData.campaignsByStatus };
      for (const row of campaignRows.data || []) {
        campaignsByStatus[row.status] += 1;
      }

      const referralsByStatus = { ...emptyData.referralsByStatus };
      for (const row of referralRows.data || []) {
        referralsByStatus[row.status] += 1;
      }

      return {
        totals: {
          content: contentCount.count || 0,
          socialPosts: socialCount.count || 0,
          emailCampaigns: campaignCount.count || 0,
          recentActivity: recentActivityCount.count || 0,
          scheduledPosts: scheduledPostsCount.count || 0,
          scheduledCampaigns: scheduledCampaignsCount.count || 0,
          referralInvites: (referralRows.data || []).length,
          referralQualified: referralsByStatus.qualified + referralsByStatus.rewarded,
          referralRewarded: referralsByStatus.rewarded,
          referralEventCount: referralEventCount.count || 0,
        },
        contentByType,
        socialByStatus,
        campaignsByStatus,
        referralsByStatus,
      };
    },
    enabled: !!profile?.organization_id,
  });
}
