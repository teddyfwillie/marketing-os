import { Card, CardContent } from "@/components/ui/card";
import { FeatureItem } from "@/content/landingContent";

interface FeaturesSectionProps {
  features: FeatureItem[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.16em] text-primary">Core capabilities</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">Everything a modern marketing engine needs.</h2>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="border-border/70 bg-card/80">
            <CardContent className="space-y-3 p-5">
              <p className="text-lg font-semibold text-foreground">{feature.title}</p>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary/90">
                {feature.stat}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
