import { Card, CardContent } from "@/components/ui/card";

interface OutcomesSectionProps {
  outcomes: string[];
}

export function OutcomesSection({ outcomes }: OutcomesSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16">
      <div className="grid gap-4 md:grid-cols-3">
        {outcomes.map((outcome) => (
          <Card key={outcome} className="border-border/70 bg-card/70">
            <CardContent className="p-5 text-sm text-foreground/90">{outcome}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
