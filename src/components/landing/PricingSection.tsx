import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PricingTier } from "@/content/landingContent";
import { PricingMode } from "./types";

interface PricingSectionProps {
  pricing: PricingTier[];
  pricingMode: PricingMode;
  onPricingModeChange: (mode: PricingMode) => void;
  onPrimaryCta: (placement: string) => void;
  isAuthenticated: boolean;
  primaryCtaLabel: string;
}

export function PricingSection({
  pricing,
  pricingMode,
  onPricingModeChange,
  onPrimaryCta,
  isAuthenticated,
  primaryCtaLabel,
}: PricingSectionProps) {
  return (
    <section id="pricing" className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-primary">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">Transparent plans for every growth stage.</h2>
        </div>
        <div className="flex rounded-full border border-border/70 bg-card/80 p-1 text-sm">
          <button
            className={`rounded-full px-3 py-1.5 ${pricingMode === "monthly" ? "bg-primary text-primary-foreground" : "text-foreground/90"}`}
            onClick={() => onPricingModeChange("monthly")}
          >
            Monthly
          </button>
          <button
            className={`rounded-full px-3 py-1.5 ${pricingMode === "annual" ? "bg-primary text-primary-foreground" : "text-foreground/90"}`}
            onClick={() => onPricingModeChange("annual")}
          >
            Annual
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {pricing.map((tier) => {
          const price = pricingMode === "monthly" ? tier.monthlyPrice : tier.annualPrice;
          return (
            <Card key={tier.name} className={`border-border/70 bg-card/80 ${tier.highlighted ? "ring-2 ring-primary/60" : ""}`}>
              <CardContent className="space-y-5 p-6">
                <div>
                  <p className="text-lg font-semibold">{tier.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                </div>
                <div>
                  <p className="text-4xl font-semibold text-primary">${price}</p>
                  <p className="text-xs text-muted-foreground/80">per workspace / month</p>
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onPrimaryCta(`pricing_${tier.name.toLowerCase()}`)}>
                  {isAuthenticated ? primaryCtaLabel : tier.cta}
                </Button>
                <div className="space-y-2">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-foreground/90">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
