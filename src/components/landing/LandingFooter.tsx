import { Link } from "react-router-dom";

interface LandingFooterProps {
  onNavClick: (target: string) => void;
}

export function LandingFooter({ onNavClick }: LandingFooterProps) {
  return (
    <footer className="border-t border-border/70 bg-background/90">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Marketing OS</p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground/80">
            The modern operating system for SMB marketing teams that need speed, clarity, and measurable outcomes.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground/90">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground/80">
            <li><a href="#features" onClick={() => onNavClick("footer_features")}>Features</a></li>
            <li><a href="#pricing" onClick={() => onNavClick("footer_pricing")}>Pricing</a></li>
            <li><Link to="/auth" onClick={() => onNavClick("footer_trial")}>Start trial</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground/90">Resources</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground/80">
            <li><a href="#faq" onClick={() => onNavClick("footer_faq")}>FAQ</a></li>
            <li><a href="#workflow" onClick={() => onNavClick("footer_workflow")}>How it works</a></li>
            <li><a href="#integrations" onClick={() => onNavClick("footer_integrations")}>Integrations</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground/90">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground/80">
            <li><a href="#" onClick={() => onNavClick("footer_privacy")}>Privacy</a></li>
            <li><a href="#" onClick={() => onNavClick("footer_terms")}>Terms</a></li>
            <li><a href="#" onClick={() => onNavClick("footer_contact")}>Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 px-4 py-4 text-center text-xs text-muted-foreground/70">
        © {new Date().getFullYear()} Marketing OS. All rights reserved.
      </div>
    </footer>
  );
}
