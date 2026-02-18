import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { landingContent } from "@/content/landingContent";
import { PricingMode } from "@/components/landing/types";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBarSection } from "@/components/landing/TrustBarSection";
import { OutcomesSection } from "@/components/landing/OutcomesSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Landing() {
  const [pricingMode, setPricingMode] = useState<PricingMode>("monthly");
  const { track } = useAnalytics();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(user);
  const primaryCtaLabelDesktop = isAuthenticated ? "Dashboard" : "Start free trial";
  const primaryCtaLabelMobile = isAuthenticated ? "Dashboard" : "Get started";

  useEffect(() => {
    void track("landing_view", { page: "landing" });
  }, [track]);

  const handlePrimaryCta = (placement: string) => {
    void track("landing_cta_click", { placement, cta_type: isAuthenticated ? "dashboard" : "start_trial" });
    navigate(isAuthenticated ? "/app" : "/auth");
  };

  const handleDemoClick = (placement: string) => {
    void track("landing_demo_click", { placement });
    const node = document.querySelector("#workflow");
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePricingMode = (mode: PricingMode) => {
    setPricingMode(mode);
    void track("landing_pricing_toggle", { mode });
  };

  const handleNavClick = (target: string) => {
    void track("landing_nav_click", { target });
  };

  return (
    <div className="landing-theme dark relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Orb glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(190 100% 60% / 0.18) 0%, hsl(190 100% 50% / 0.06) 50%, transparent 80%)" }}
      />
      {/* Grid lines */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_58%,transparent_100%)]" />
      {/* Left panel */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-[18vw]"
        style={{ clipPath: "polygon(0 0, 88% 0, 70% 100%, 0 100%)", background: "hsl(222 50% 4% / 0.85)" }}
      />
      {/* Right panel */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-[18vw]"
        style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 30% 100%)", background: "hsl(222 50% 4% / 0.85)" }}
      />
      {/* Wave terrain */}
      <div
        className="pointer-events-none absolute left-0 right-0"
        style={{
          top: "calc(100vh - 140px)",
          height: "140px",
          borderTop: "1px solid hsl(190 100% 60% / 0.25)",
          background: "linear-gradient(to top, hsl(190 100% 50% / 0.12), transparent)",
          animation: "glow-pulse 4s ease-in-out infinite",
        }}
      />

      <div className="relative">
        <div className="border-b border-border/90 bg-background/90 px-4 py-2 text-center text-xs text-muted-foreground backdrop-blur">
          <span className="font-medium text-primary">Release:</span> {landingContent.announcement}
        </div>

        <LandingNav
          onNavClick={handleNavClick}
          onPrimaryCta={handlePrimaryCta}
          isAuthenticated={isAuthenticated}
          primaryCtaLabelDesktop={primaryCtaLabelDesktop}
          primaryCtaLabelMobile={primaryCtaLabelMobile}
        />

        <main>
          <HeroSection onPrimaryCta={handlePrimaryCta} onDemoClick={handleDemoClick} primaryCtaLabel={primaryCtaLabelDesktop} />
          <TrustBarSection brands={landingContent.logos} />
          <OutcomesSection outcomes={landingContent.outcomes} />
          <FeaturesSection features={[...landingContent.features]} />
          <WorkflowSection />
          <IntegrationsSection integrations={[...landingContent.integrations]} />
          <MetricsSection />
          <PricingSection
            pricing={[...landingContent.pricing]}
            pricingMode={pricingMode}
            onPricingModeChange={handlePricingMode}
            onPrimaryCta={handlePrimaryCta}
            isAuthenticated={isAuthenticated}
            primaryCtaLabel={primaryCtaLabelDesktop}
          />
          <TestimonialsSection testimonials={[...landingContent.testimonials]} />
          <FaqSection faq={[...landingContent.faq]} onFaqExpand={(question) => void track("landing_faq_expand", { question })} />
          <FinalCtaSection onPrimaryCta={handlePrimaryCta} onDemoClick={handleDemoClick} primaryCtaLabel={primaryCtaLabelDesktop} />
        </main>

        <LandingFooter onNavClick={handleNavClick} />
      </div>
    </div>
  );
}
