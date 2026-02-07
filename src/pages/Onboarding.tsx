import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Building2, Users, Globe, ArrowRight, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { clearStoredReferral, getStoredReferralCode, getStoredReferralSource, normalizeReferralCode, storeReferralCode } from "@/lib/referrals";
import { useClaimReferral } from "@/hooks/useReferrals";
import { useAnalytics } from "@/hooks/useAnalytics";

const industries = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
  { value: "education", label: "Education" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Professional Services" },
  { value: "other", label: "Other" },
];

const companySizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

type IndustryType = Database["public"]["Enums"]["industry_type"];
type CompanySizeType = Database["public"]["Enums"]["company_size"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const claimReferral = useClaimReferral();
  const { track } = useAnalytics();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pendingReferralCode, setPendingReferralCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organizationName: "",
    industry: "",
    companySize: "",
    website: "",
  });

  useEffect(() => {
    const refFromQuery = searchParams.get("ref");
    if (refFromQuery) {
      const normalized = normalizeReferralCode(refFromQuery);
      storeReferralCode(normalized, "onboarding_query_param");
      setPendingReferralCode(normalized);
      return;
    }

    setPendingReferralCode(getStoredReferralCode());
  }, [searchParams]);

  const handleNext = () => {
    if (step === 1 && !formData.organizationName) {
      toast({ title: "Organization name required", description: "Please enter your organization name.", variant: "destructive" });
      return;
    }
    if (step === 2 && !formData.industry) {
      toast({ title: "Industry required", description: "Please select your industry.", variant: "destructive" });
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    if (!formData.companySize) {
      toast({ title: "Company size required", description: "Please select your company size.", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Not authenticated", description: "Please sign in first.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: formData.organizationName,
          industry: formData.industry as IndustryType,
          company_size: formData.companySize as CompanySizeType,
          website: formData.website || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ organization_id: org.id, onboarding_completed: true })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, organization_id: org.id, role: "admin" });

      if (roleError) throw roleError;

      await refreshProfile();

      if (pendingReferralCode) {
        try {
          await claimReferral.mutateAsync({
            code: pendingReferralCode,
            source: getStoredReferralSource() || "onboarding_completion",
          });
          clearStoredReferral();
          await track("referral_claimed", { source: "onboarding_completion" });
        } catch {
          // Mutation has user-facing toast; proceed with onboarding completion.
        }
      }

      await track("onboarding_completed", { has_referral: Boolean(pendingReferralCode) });
      toast({ title: "Setup complete", description: "Your workspace is ready." });
      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      toast({ title: "Setup failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,hsl(var(--primary)/0.2),transparent_28%),radial-gradient(circle_at_80%_84%,hsl(var(--chart-2)/0.16),transparent_36%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-border/70 bg-card/85 p-8 shadow-xl backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Onboarding</p>
          <h1 className="mt-3 text-4xl font-bold text-foreground">Set up your marketing workspace.</h1>
          <p className="mt-3 text-sm text-muted-foreground">This takes around 2 minutes and configures analytics defaults and campaign presets.</p>
          <div className="mt-6 space-y-3">
            {["Workspace profile", "Industry context", "Team size and baseline settings"].map((item, idx) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{idx + 1}</span>
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
          {pendingReferralCode ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
              <Gift className="mt-0.5 h-4 w-4 text-primary" />
              <p>
                Invite code <span className="font-semibold">{pendingReferralCode}</span> will be applied when setup finishes.
              </p>
            </div>
          ) : null}
        </section>

        <Card className="app-surface w-full rounded-3xl border-border/70 bg-card/90">
          <CardHeader className="text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-3xl">Set Up Your Workspace</CardTitle>
            <CardDescription>Step {step} of 3</CardDescription>
            <div className="mt-2 flex justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-2.5 w-12 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">Organization details</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="Acme Inc"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="website"
                      placeholder="www.example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleNext}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">Industry context</span>
                </div>
                <div className="space-y-2">
                  <Label>Which industry best describes your business?</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleNext}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Team size</span>
                </div>
                <div className="space-y-2">
                  <Label>How many people work at your organization?</Label>
                  <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleComplete} disabled={loading}>
                  {loading ? (
                    "Setting up..."
                  ) : (
                    <>
                      Complete Setup
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
