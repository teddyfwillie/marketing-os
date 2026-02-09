import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { normalizeReferralCode, storeReferralCode } from "@/lib/referrals";
import { useAnalytics } from "@/hooks/useAnalytics";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { track } = useAnalytics();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refFromQuery = searchParams.get("ref");
    if (!refFromQuery) return;
    const normalizedCode = normalizeReferralCode(refFromQuery);
    setReferralCode(normalizedCode);
    storeReferralCode(normalizedCode, "auth_query_param");
    void track("referral_param_captured", { source: "auth_query_param" });
  }, [searchParams, track]);

  if (user) {
    navigate("/app");
    return null;
  }

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
      }
      return false;
    }
  };

  const persistReferral = () => {
    const normalizedCode = normalizeReferralCode(referralCode);
    if (normalizedCode) {
      storeReferralCode(normalizedCode, "auth_form");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    persistReferral();
    void track("auth_signin_submit");
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      let message = error.message;
      if (message.includes("Invalid login credentials")) {
        message = "Invalid email or password. Please try again.";
      }
      toast({ title: "Sign In Failed", description: message, variant: "destructive" });
      return;
    }

    toast({ title: "Welcome back", description: "You have successfully signed in." });
    navigate("/app");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    persistReferral();
    void track("auth_signup_submit", { has_referral: Boolean(referralCode.trim()) });
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      let message = error.message;
      if (message.includes("User already registered")) {
        message = "An account with this email already exists. Please sign in instead.";
      }
      toast({ title: "Sign Up Failed", description: message, variant: "destructive" });
      return;
    }

    toast({ title: "Account Created", description: "Check your email for confirmation, then sign in." });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    persistReferral();
    void track("auth_google_submit", { has_referral: Boolean(referralCode.trim()) });
    const { error } = await signInWithGoogle();
    setLoading(false);

    if (error) {
      toast({ title: "Google Sign In Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary)/0.2),transparent_30%),radial-gradient(circle_at_80%_80%,hsl(var(--chart-2)/0.18),transparent_36%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-border/70 bg-card/85 p-8 shadow-xl backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Marketing OS</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground">Build campaigns that actually convert.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            One workspace for content, social, email, and analytics. Move faster without context switching.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              "AI-assisted content and campaign workflows",
              "Cross-channel scheduling with visibility",
              "Live performance insights and action planning",
            ].map((point) => (
              <div key={point} className="rounded-xl border border-border/70 bg-muted/35 px-4 py-3 text-sm text-foreground">
                {point}
              </div>
            ))}
          </div>
        </section>

        <Card className="app-surface w-full rounded-3xl border-border/70 bg-card/90">
          <CardHeader className="text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-3xl">Welcome</CardTitle>
            <CardDescription>Sign in to continue to your growth workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="signin-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                    {!loading ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referral-code">Invite Code (optional)</Label>
                    <div className="relative">
                      <Gift className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="referral-code"
                        placeholder="Enter referral code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                    {!loading ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
