import { useMemo, useState } from "react";
import { User, Bell, Shield, CreditCard, LogOut, Sliders, Gift, Copy, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageHero } from "@/components/layout/PageHero";
import { useCreditBalance, useCreditLedger, useReferralCode, useReferrals } from "@/hooks/useReferrals";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, signOut, refreshProfile } = useAuth();
  const { data: organization } = useOrganization();
  const { data: referralCode } = useReferralCode();
  const { data: referrals } = useReferrals();
  const { data: creditBalance = 0 } = useCreditBalance();
  const { data: creditLedger = [] } = useCreditLedger();
  const { track } = useAnalytics();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);

  const referralLink = useMemo(() => {
    if (!referralCode?.code) return "";
    return `${window.location.origin}/auth?ref=${referralCode.code}`;
  }, [referralCode?.code]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", profile.user_id);
    setSaving(false);

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      return;
    }

    await refreshProfile();
    void track("settings_profile_saved");
    toast({ title: "Profile updated" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const copyValue = async (value: string, type: "link" | "code") => {
    if (!value) return;

    await navigator.clipboard.writeText(value);
    void track(type === "link" ? "referral_link_copied" : "referral_code_copied");
    toast({ title: "Copied", description: type === "link" ? "Referral link copied." : "Referral code copied." });
  };

  const shareLink = async () => {
    if (!referralLink) return;

    if (navigator.share) {
      await navigator.share({
        title: "Join my Marketing OS workspace",
        text: "Use my referral link to sign up.",
        url: referralLink,
      });
      void track("referral_link_shared", { method: "native_share" });
      return;
    }

    await copyValue(referralLink, "link");
  };

  return (
    <AppLayout title="Settings" subtitle="Control workspace preferences, profile, and account behavior.">
      <PageHero
        eyebrow="Configuration"
        title="Workspace controls"
        description="Update profile details, integrations, and referral growth settings in one place."
        icon={Sliders}
      />

      <Tabs defaultValue="profile" className="stagger-fade max-w-6xl space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl bg-muted/40 p-2 md:grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={profile?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <Input value={organization?.name || "Not set"} disabled />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how updates are delivered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email notifications</p>
                  <p className="text-sm text-muted-foreground">Receive campaign updates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Campaign reports</p>
                  <p className="text-sm text-muted-foreground">Weekly summaries</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Competitor alerts</p>
                  <p className="text-sm text-muted-foreground">Changes and scan updates</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-5 w-5" />
                Integrations
              </CardTitle>
              <CardDescription>Connect external distribution channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Twitter / X", tag: "X", className: "bg-chart-2/15 text-chart-2" },
                { label: "Instagram", tag: "IG", className: "bg-chart-3/15 text-chart-3" },
                { label: "LinkedIn", tag: "in", className: "bg-primary/15 text-primary" },
              ].map((integration) => (
                <div key={integration.label} className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/25 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-semibold ${integration.className}`}>
                      {integration.tag}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{integration.label}</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5" />
                Billing
              </CardTitle>
              <CardDescription>Manage plan and payment preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/25 p-4">
                <div>
                  <p className="font-medium text-foreground">Free Plan</p>
                  <p className="text-sm text-muted-foreground">Essential workflows for getting started</p>
                </div>
                <Button>Upgrade</Button>
              </div>
              <Separator />
              <Button variant="destructive" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Invites Sent</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{referrals?.summary.sent || 0}</p>
              </CardContent>
            </Card>
            <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Converted</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{referrals?.summary.converted || 0}</p>
              </CardContent>
            </Card>
            <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Credit Balance</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{creditBalance}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Gift className="h-5 w-5" />
                Referral Link
              </CardTitle>
              <CardDescription>Share your code and earn usage credits when invitees complete onboarding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Invite Code</Label>
                <div className="flex gap-2">
                  <Input value={referralCode?.code || ""} readOnly placeholder="Generating..." />
                  <Button variant="outline" className="gap-2" onClick={() => void copyValue(referralCode?.code || "", "code")}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Shareable Link</Label>
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly placeholder="Generating..." />
                  <Button variant="outline" className="gap-2" onClick={() => void copyValue(referralLink, "link")}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button className="gap-2" onClick={() => void shareLink()}>
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl">Referral Status</CardTitle>
              <CardDescription>Track invitation progress through qualification and rewards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {referrals?.sent?.length ? (
                referrals.sent.map((row) => (
                  <div key={row.id} className="rounded-xl border border-border/70 bg-muted/25 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-foreground">Referral created {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}</p>
                        <p className="text-xs text-muted-foreground">Source: {row.source || "direct"}</p>
                      </div>
                      <Badge variant={row.status === "rewarded" ? "default" : "secondary"}>{row.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No referrals yet. Share your link to start earning credits.</p>
              )}
            </CardContent>
          </Card>

          <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl">Credit Ledger</CardTitle>
              <CardDescription>Recent credit rewards and usage deductions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {creditLedger.length ? (
                creditLedger.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/25 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.reason.replaceAll("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</p>
                    </div>
                    <span className={`text-sm font-semibold ${entry.delta > 0 ? "text-emerald-600" : "text-foreground"}`}>
                      {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No credit activity yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
