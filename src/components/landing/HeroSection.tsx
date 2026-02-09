import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HeroSectionProps {
  onPrimaryCta: (placement: string) => void;
  onDemoClick: (placement: string) => void;
  primaryCtaLabel: string;
}

export function HeroSection({ onPrimaryCta, onDemoClick, primaryCtaLabel }: HeroSectionProps) {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-16 pt-16 md:grid-cols-2 md:pt-24">
      <div className="space-y-6">
        <Badge className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary/90">
          Built for SMB marketing teams
        </Badge>
        <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
          Plan, launch, and optimize modern campaigns from one system.
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          Marketing OS unifies content, social, email, and analytics so your team can ship faster and make better
          decisions with less operational overhead.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onPrimaryCta("hero")}>
            {primaryCtaLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border/70 bg-card/70 text-foreground hover:bg-muted"
            onClick={() => onDemoClick("hero")}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Watch platform tour
          </Button>
        </div>
        <div className="grid gap-3 pt-2 text-sm text-muted-foreground sm:grid-cols-2">
          {["14-day free trial", "No credit card required", "Cancel anytime", "Guided onboarding"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/80 shadow-2xl shadow-primary/20">
        <CardContent className="space-y-4 p-6">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground/80">Campaign health</p>
            <p className="mt-2 text-3xl font-semibold text-primary">+27.4%</p>
            <p className="text-sm text-muted-foreground">Conversion lift from optimized channel mix this quarter.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground/80">Weekly launches</p>
              <p className="mt-2 text-2xl font-semibold">18</p>
              <p className="text-xs text-muted-foreground/80">Across social + email</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground/80">Team velocity</p>
              <p className="mt-2 text-2xl font-semibold">3.2x</p>
              <p className="text-xs text-muted-foreground/80">Faster draft-to-publish</p>
            </div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary/85">
            Live insight: Retargeting email variation B is outperforming control by 19%.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
