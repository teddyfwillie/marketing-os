import { Eye, Users, FileText, Mail, Rocket } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useCreditBalance, useReferrals } from "@/hooks/useReferrals";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function Dashboard() {
  const { data: metrics, isLoading } = useDashboardMetrics();
  const { data: referrals } = useReferrals();
  const { data: creditBalance = 0 } = useCreditBalance();
  const { track } = useAnalytics();
  const navigate = useNavigate();

  const dashboardMetrics = [
    {
      title: "Content Created",
      value: isLoading ? "..." : String(metrics?.totalContent || 0),
      change: 12.5,
      changeLabel: "vs last month",
      icon: FileText,
    },
    {
      title: "Social Posts",
      value: isLoading ? "..." : String(metrics?.totalPosts || 0),
      change: 2.1,
      changeLabel: "vs last month",
      icon: Users,
    },
    {
      title: "Email Campaigns",
      value: isLoading ? "..." : String(metrics?.totalCampaigns || 0),
      change: -5.2,
      changeLabel: "vs last month",
      icon: Mail,
    },
    {
      title: "Competitors Tracked",
      value: isLoading ? "..." : String(metrics?.totalCompetitors || 0),
      change: 8.3,
      changeLabel: "vs last month",
      icon: Eye,
    },
  ];

  return (
    <AppLayout title="Dashboard" subtitle="Command center for growth, campaigns, and performance.">
      <PageHero
        eyebrow="Weekly Focus"
        title="Your marketing system is live"
        description="Track momentum, execute campaigns, and close the loop faster with one workspace."
        icon={Rocket}
        actions={
          <>
            <Button
              onClick={() => {
                void track("dashboard_create_content_clicked");
                navigate("/content");
              }}
            >
              Create content
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void track("dashboard_open_analytics_clicked");
                navigate("/analytics");
              }}
            >
              Open analytics
            </Button>
          </>
        }
      />

      <div className="stagger-fade grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="stagger-fade">
        <PerformanceChart />
      </div>

      <div className="stagger-fade grid grid-cols-1 gap-6 lg:grid-cols-4">
        <QuickActions />
        <div className="space-y-6 lg:col-span-2 xl:col-span-1">
          <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
            <CardContent className="space-y-3 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Referral Snapshot</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-muted/35 px-2 py-2 text-center">
                  <p className="text-lg font-bold text-foreground">{referrals?.summary.sent || 0}</p>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Sent</p>
                </div>
                <div className="rounded-lg bg-muted/35 px-2 py-2 text-center">
                  <p className="text-lg font-bold text-foreground">{referrals?.summary.converted || 0}</p>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Converted</p>
                </div>
                <div className="rounded-lg bg-muted/35 px-2 py-2 text-center">
                  <p className="text-lg font-bold text-foreground">{creditBalance}</p>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Credits</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  void track("dashboard_open_referrals_clicked");
                  navigate("/settings");
                }}
              >
                Manage referrals
              </Button>
            </CardContent>
          </Card>
          <RecentActivity />
          <UpcomingTasks />
        </div>
      </div>
    </AppLayout>
  );
}
