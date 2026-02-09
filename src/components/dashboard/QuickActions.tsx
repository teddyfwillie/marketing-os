import { FileText, Share2, Mail, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "Create Content",
    description: "Draft blogs, ads, and campaign assets",
    icon: FileText,
    path: "/app/content",
    color: "bg-chart-2/20 text-chart-2",
  },
  {
    title: "Schedule Social",
    description: "Plan multi-platform posts",
    icon: Share2,
    path: "/app/social",
    color: "bg-chart-3/20 text-chart-3",
  },
  {
    title: "Launch Email",
    description: "Ship targeted campaign sequences",
    icon: Mail,
    path: "/app/email",
    color: "bg-primary/20 text-primary",
  },
  {
    title: "Track Competitor",
    description: "Scan and compare competitor moves",
    icon: Users,
    path: "/app/competitors",
    color: "bg-chart-5/20 text-chart-5",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card className="app-surface rounded-2xl border-border/70 bg-card/80 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl">Action Hub</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant="outline"
            className="h-auto justify-start gap-3 rounded-xl border-border/70 p-4 text-left"
            onClick={() => navigate(action.path)}
          >
            <div className={`rounded-lg p-2 ${action.color}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{action.title}</p>
              <p className="truncate text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
