import { ArrowRight, BarChart2, CheckCircle2, FileText, PlayCircle, Share2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface HeroSectionProps {
  onPrimaryCta: (placement: string) => void;
  onDemoClick: (placement: string) => void;
  primaryCtaLabel: string;
}

export function HeroSection({ onPrimaryCta, onDemoClick, primaryCtaLabel }: HeroSectionProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-20 text-center md:pt-28">
      <div className="space-y-6">
        <Badge className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary/90">
          Built for SMB marketing teams
        </Badge>
        <h1 className="mx-auto text-center text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
          Plan, launch, and optimize{" "}
          <br className="hidden sm:block" />
          modern campaigns from one system.
        </h1>
        <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
          Marketing OS unifies content, social, email, and analytics so your team can ship faster and make better
          decisions with less operational overhead.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onPrimaryCta("hero")}
          >
            {primaryCtaLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-primary/30 bg-primary/5 text-foreground backdrop-blur hover:border-primary/50 hover:bg-primary/10"
            onClick={() => onDemoClick("hero")}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Watch platform tour
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 pt-2 text-sm text-muted-foreground">
          {["14-day free trial", "No credit card required", "Cancel anytime", "Guided onboarding"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard mockup */}
      <Card
        className="mt-12 overflow-hidden rounded-2xl border-border/60 bg-card"
        style={{
          boxShadow:
            "0 0 0 1px hsl(190 100% 50% / 0.08), 0 32px 64px -16px hsl(222 47% 3% / 0.8), 0 0 80px -20px hsl(190 100% 50% / 0.12)",
        }}
      >
        {/* Chrome bar */}
        <div className="flex items-center gap-2 border-b border-border/60 bg-card/90 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-border/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-border/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-border/80" />
          </div>
          <div className="mx-auto flex h-5 w-48 items-center rounded bg-muted/60 px-2">
            <span className="text-[10px] text-muted-foreground/60">app.marketingos.com</span>
          </div>
        </div>

        {/* App body */}
        <div className="flex h-64 sm:h-80">
          {/* Sidebar */}
          <div className="flex w-36 shrink-0 flex-col gap-1 border-r border-border/60 bg-muted/30 p-3">
            <div className="mb-2 flex items-center gap-1.5 px-1">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/20">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">MKT OS</span>
            </div>
            <div className="rounded-md bg-primary/15 px-2 py-1.5">
              <span className="text-[11px] font-medium text-primary">Dashboard</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted-foreground/70">
              <FileText className="h-3 w-3" />
              <span className="text-[11px]">Campaigns</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted-foreground/70">
              <Share2 className="h-3 w-3" />
              <span className="text-[11px]">Publishing</span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
            {/* Stat tiles */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Campaign Health", value: "+27.4%" },
                { label: "Weekly Launches", value: "18" },
                { label: "Team Velocity", value: "3.2×" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border/60 bg-background/60 p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70">{stat.label}</p>
                  <p className="mt-1 text-sm font-semibold text-primary">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* SVG bar chart */}
            <div className="flex-1 rounded-lg border border-border/60 bg-background/40 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <BarChart2 className="h-3 w-3 text-muted-foreground/60" />
                <span className="text-[10px] text-muted-foreground/60">Weekly performance</span>
              </div>
              <svg viewBox="0 0 200 60" className="h-full w-full" preserveAspectRatio="none">
                {[28, 42, 35, 55, 38, 62, 45, 58, 40, 70].map((h, i) => (
                  <rect
                    key={i}
                    x={i * 20 + 2}
                    y={60 - h}
                    width={16}
                    height={h}
                    rx={2}
                    fill={i === 9 ? "hsl(190 100% 50% / 0.7)" : "hsl(190 100% 50% / 0.2)"}
                  />
                ))}
              </svg>
            </div>

            {/* Insight banner */}
            <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-left text-[11px] text-primary/85">
              Live insight: Retargeting email variation B is outperforming control by 19%.
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
