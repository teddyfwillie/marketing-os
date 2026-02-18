import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavItem } from "./types";

const navItems: LandingNavItem[] = [
  { id: "features", label: "Features" },
  { id: "workflow", label: "How it works" },
  { id: "integrations", label: "Integrations" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

interface LandingNavProps {
  onNavClick: (target: string) => void;
  onPrimaryCta: (placement: string) => void;
  isAuthenticated: boolean;
  primaryCtaLabelDesktop: string;
  primaryCtaLabelMobile: string;
}

export function LandingNav({
  onNavClick,
  onPrimaryCta,
  isAuthenticated,
  primaryCtaLabelDesktop,
  primaryCtaLabelMobile,
}: LandingNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:py-4">
        <button
          className="flex min-w-0 items-center gap-2 rounded-md text-left"
          onClick={() => {
            onNavClick("top");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary sm:h-9 sm:w-9">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-sm sm:tracking-[0.18em]">
              Marketing OS
            </span>
            <span className="hidden text-xs text-muted-foreground/80 sm:block">Campaign operating system</span>
          </span>
        </button>

        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="transition-colors hover:text-primary"
              onClick={() => onNavClick(item.id)}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isAuthenticated ? (
            <Button variant="ghost" asChild className="hidden text-foreground/90 hover:bg-card hover:text-foreground sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
          ) : null}
          <Button
            size="sm"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:h-10 sm:px-5 sm:py-2"
            onClick={() => onPrimaryCta("nav")}
          >
            <span className="sm:hidden">{primaryCtaLabelMobile}</span>
            <span className="hidden sm:inline">{primaryCtaLabelDesktop}</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
