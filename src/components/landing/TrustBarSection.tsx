import { Card, CardContent } from "@/components/ui/card";

interface TrustBarSectionProps {
  brands: string[];
}

export function TrustBarSection({ brands }: TrustBarSectionProps) {
  return (
    <section className="border-y border-border/80 bg-background/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
          Built for teams running campaigns across these ecosystems
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-center sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((brand) => (
            <Card key={brand} className="border-border/70 bg-card/80">
              <CardContent className="px-4 py-3 text-sm text-muted-foreground">{brand}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
