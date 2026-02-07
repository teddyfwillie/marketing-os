import { BarChart3, Clock, FileText, Mail, Share2, Activity, LineChart, Gift } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/common/EmptyState";

export default function Analytics() {
  const { data, isLoading } = useAnalyticsData();

  const metrics = [
    { title: "Generated Content", value: data?.totals.content || 0, icon: FileText },
    { title: "Social Posts", value: data?.totals.socialPosts || 0, icon: Share2 },
    { title: "Email Campaigns", value: data?.totals.emailCampaigns || 0, icon: Mail },
    { title: "Recent Activity (7 days)", value: data?.totals.recentActivity || 0, icon: Activity },
  ];

  return (
    <AppLayout title="Analytics" subtitle="Read what is working and where momentum is dropping.">
      <PageHero
        eyebrow="Insights"
        title="Performance narrative"
        description="Monitor campaign execution across content, social, and email with live totals."
        icon={LineChart}
      />

      <div className="stagger-fade grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="app-surface rounded-2xl border-border/70 bg-card/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/15 p-2.5">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground">{metric.value}</p>
                  <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{metric.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="stagger-fade grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Content by Type</CardTitle>
            <Badge variant="secondary">{data?.totals.content || 0}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : Object.keys(data?.contentByType || {}).length ? (
              Object.entries(data?.contentByType || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between rounded-lg bg-muted/35 px-3 py-2 text-sm">
                  <span className="capitalize text-muted-foreground">{type}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ))
            ) : (
              <EmptyState title="No content yet" description="Generate content to unlock type trends." />
            )}
          </CardContent>
        </Card>

        <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Social Post Status</CardTitle>
            <Badge variant="secondary">{data?.totals.socialPosts || 0}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              Object.entries(data?.socialByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg bg-muted/35 px-3 py-2 text-sm">
                  <span className="capitalize text-muted-foreground">{status}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Email Campaign Status</CardTitle>
            <Badge variant="secondary">{data?.totals.emailCampaigns || 0}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              Object.entries(data?.campaignsByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg bg-muted/35 px-3 py-2 text-sm">
                  <span className="capitalize text-muted-foreground">{status}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="stagger-fade app-surface rounded-2xl border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Scheduled Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Scheduled Social Posts</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{data?.totals.scheduledPosts || 0}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Scheduled Email Campaigns</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{data?.totals.scheduledCampaigns || 0}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="stagger-fade app-surface rounded-2xl border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            Referral Acquisition Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Invites</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{data?.totals.referralInvites || 0}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Qualified</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{data?.totals.referralQualified || 0}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Rewarded</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{data?.totals.referralRewarded || 0}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Tracked Events</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{data?.totals.referralEventCount || 0}</p>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
