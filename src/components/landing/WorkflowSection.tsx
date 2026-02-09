import { Card, CardContent } from "@/components/ui/card";

export function WorkflowSection() {
  return (
    <section id="workflow" className="mx-auto w-full max-w-7xl px-4 py-16">
      <div className="rounded-3xl border border-border/70 bg-card/70 p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-primary">How it works</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground">Plan. Launch. Optimize.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { title: "Plan", text: "Build briefs, map channels, and assign owners in one workspace." },
            { title: "Launch", text: "Ship coordinated campaigns across content, social, and email." },
            { title: "Optimize", text: "Read outcomes, identify winners, and scale what works." },
          ].map((step, idx) => (
            <Card key={step.title} className="border-border/70 bg-background/70">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">Step {idx + 1}</p>
                <p className="mt-2 text-lg font-semibold">{step.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
