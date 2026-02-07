import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: LucideIcon;
}

export function MetricCard({ title, value, change, changeLabel, icon: Icon }: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
            <p className="text-3xl font-extrabold text-foreground">{value}</p>
            <div className="flex items-center gap-1.5 text-xs">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-chart-5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className={cn("font-semibold", isPositive ? "text-chart-5" : "text-destructive")}>
                {isPositive ? "+" : ""}
                {change}%
              </span>
              <span className="text-muted-foreground">{changeLabel}</span>
            </div>
          </div>
          <div className="rounded-xl bg-primary/15 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
