import { Button } from "@/components/ui/button";

interface FinalCtaSectionProps {
  onPrimaryCta: (placement: string) => void;
  onDemoClick: (placement: string) => void;
  primaryCtaLabel: string;
}

export function FinalCtaSection({ onPrimaryCta, onDemoClick, primaryCtaLabel }: FinalCtaSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-16">
      <div className="rounded-3xl border border-primary/30 bg-primary/10 p-8 text-center sm:p-12">
        <p className="text-xs uppercase tracking-[0.16em] text-primary/90">Ready to grow smarter?</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          Replace scattered execution with one marketing operating system.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-foreground/90 sm:text-base">
          Start your free trial and launch your first coordinated campaign this week.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onPrimaryCta("final_banner")}>
            {primaryCtaLabel}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border/70 bg-background/30 text-foreground hover:bg-card"
            onClick={() => onDemoClick("final_banner")}
          >
            Watch platform tour
          </Button>
        </div>
      </div>
    </section>
  );
}
