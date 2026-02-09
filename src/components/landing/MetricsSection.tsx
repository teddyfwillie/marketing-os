import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  { value: "38%", label: "Higher campaign throughput" },
  { value: "21%", label: "Lower CAC in 90 days" },
  { value: "9 hrs", label: "Saved weekly in reporting" },
];

export function MetricsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16">
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-border/70 bg-card/75 text-center">
            <CardContent className="p-6">
              <p className="text-4xl font-semibold text-primary">{metric.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
