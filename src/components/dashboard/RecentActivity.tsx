import { FileText, Share2, Mail, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivity } from "@/hooks/useActivity";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/common/EmptyState";

const typeIcons = {
  content: FileText,
  social: Share2,
  email: Mail,
  analytics: TrendingUp,
};

const typeColors = {
  content: "bg-chart-2/20 text-chart-2",
  social: "bg-chart-3/20 text-chart-3",
  email: "bg-primary/20 text-primary",
  analytics: "bg-chart-5/20 text-chart-5",
};

export function RecentActivity() {
  const { data: activities, isLoading } = useActivity();

  return (
    <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Recent Activity</CardTitle>
        <Badge variant="secondary" className="text-xs">
          {activities?.length || 0} items
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading activity...</p>
        ) : activities && activities.length > 0 ? (
          activities.slice(0, 4).map((activity) => {
            const activityType = activity.activity_type as keyof typeof typeIcons;
            const Icon = typeIcons[activityType] || FileText;
            const colorClass = typeColors[activityType] || typeColors.content;

            return (
              <div key={activity.id} className="rounded-xl border border-border/70 bg-muted/30 p-3">
                <div className="mb-2 flex items-start gap-2">
                  <div className={`rounded-lg p-1.5 ${colorClass}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{activity.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            );
          })
        ) : (
          <EmptyState title="No activity yet" description="Your latest actions will appear here once you start creating." />
        )}
      </CardContent>
    </Card>
  );
}
