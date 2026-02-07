import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  description: string;
  eyebrow?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHero({
  title,
  description,
  eyebrow,
  icon: Icon,
  actions,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-6 shadow-md md:p-8",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-chart-2/10" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          {eyebrow ? (
            <p className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <div className="flex items-center gap-3">
            {Icon ? (
              <div className="rounded-xl bg-primary/15 p-2.5 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            ) : null}
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
        </div>
        {actions ? <div className="relative flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
