import { useState } from "react";
import { Mail, Plus, Users, Send, Clock, Eye, MousePointer, Inbox, Sparkles, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmailCampaigns, useCreateEmailCampaign, useUpdateEmailCampaign } from "@/hooks/useEmailCampaigns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/common/EmptyState";

const audienceOptions = [
  { value: "all", label: "All Subscribers" },
  { value: "new", label: "New Subscribers (Last 30 days)" },
  { value: "engaged", label: "Engaged Users" },
  { value: "inactive", label: "Inactive Users" },
];

export default function EmailCampaigns() {
  const { data: campaigns, isLoading } = useEmailCampaigns();
  const createCampaign = useCreateEmailCampaign();
  const updateCampaign = useUpdateEmailCampaign();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("all");
  const [openScheduleId, setOpenScheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const totalSent = campaigns?.filter((c) => c.status === "active" || c.status === "completed").length || 0;
  const avgOpenRate = campaigns?.length
    ? campaigns.reduce((sum, c) => sum + (Number(c.open_rate) || 0), 0) / campaigns.length
    : 0;
  const avgClickRate = campaigns?.length
    ? campaigns.reduce((sum, c) => sum + (Number(c.click_rate) || 0), 0) / campaigns.length
    : 0;

  const emailStats = [
    { label: "Total Campaigns", value: String(campaigns?.length || 0), icon: Users },
    { label: "Sent Campaigns", value: String(totalSent), icon: Send },
    { label: "Avg. Open Rate", value: `${avgOpenRate.toFixed(1)}%`, icon: Eye },
    { label: "Avg. Click Rate", value: `${avgClickRate.toFixed(1)}%`, icon: MousePointer },
  ];

  const handleSchedule = async () => {
    if (!name.trim()) return;

    await createCampaign.mutateAsync({ name, subject, content, audience, status: "scheduled" });
    setName("");
    setSubject("");
    setContent("");
    setAudience("all");
  };

  const handleSendNow = async () => {
    if (!name.trim()) return;

    await createCampaign.mutateAsync({ name, subject, content, audience, status: "active" });
    setName("");
    setSubject("");
    setContent("");
    setAudience("all");
  };

  const handleOpenReschedule = (campaignId: string, scheduledAt?: string | null) => {
    setOpenScheduleId(campaignId);
    if (!scheduledAt) {
      setRescheduleDate("");
      setRescheduleTime("");
      return;
    }

    const d = new Date(scheduledAt);
    setRescheduleDate(d.toISOString().split("T")[0]);
    setRescheduleTime(d.toTimeString().slice(0, 5));
  };

  const handleSaveReschedule = async (campaignId: string) => {
    if (!rescheduleDate || !rescheduleTime) return;
    const scheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();

    await updateCampaign.mutateAsync({ id: campaignId, scheduled_at: scheduledAt, status: "scheduled" });
    setOpenScheduleId(null);
  };

  const handleGenerateWithAi = async () => {
    if (!name.trim()) {
      toast({ title: "Campaign name required", description: "Add a campaign name first.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create an email campaign draft.\nCampaign name: ${name}\nAudience: ${audience}\nCurrent subject: ${subject || "none"}\nInclude a compelling opening, value-focused body, and clear CTA.`;
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { prompt, contentType: "email", tone: "persuasive" },
      });
      if (error) throw error;

      const generatedBody = data?.content?.trim();
      if (!generatedBody) throw new Error("No content returned");

      setContent(generatedBody);
      if (!subject.trim()) {
        setSubject(`${name} - quick update`);
      }
      toast({ title: "Campaign draft generated" });
    } catch {
      toast({ title: "AI generation failed", description: "Unable to generate campaign right now.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout title="Email Campaigns" subtitle="Build sequences, monitor performance, and optimize opens.">
      <PageHero
        eyebrow="Lifecycle"
        title="Campaign pipeline"
        description="Draft and launch campaigns with audience targeting and scheduling controls."
        icon={Inbox}
      />

      <div className="stagger-fade grid grid-cols-2 gap-4 lg:grid-cols-4">
        {emailStats.map((stat) => (
          <Card key={stat.label} className="app-surface rounded-2xl border-border/70 bg-card/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/15 p-2.5">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="stagger-fade grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="app-surface rounded-2xl border-border/70 bg-card/80 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-primary" />
              New Campaign
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input placeholder="Spring launch sequence" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input placeholder="Make it urgent and clear" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email Content</Label>
              <Textarea placeholder="Write your campaign copy..." className="min-h-[120px] resize-none" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGenerateWithAi} disabled={isGenerating || !name.trim()}>
              {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gap-2" onClick={handleSchedule} disabled={createCampaign.isPending || !name.trim()}>
                <Clock className="h-4 w-4" />
                Schedule
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleSendNow} disabled={createCampaign.isPending || !name.trim()}>
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="app-surface rounded-2xl border-border/70 bg-card/80 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-5 w-5 text-primary" />
              Campaign Queue
            </CardTitle>
            <Badge variant="secondary">{campaigns?.length || 0} total</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Loading campaigns...</p>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="rounded-xl border border-border/70 bg-muted/25 p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.subscriber_count?.toLocaleString() || 0} subscribers</p>
                      </div>
                      <Badge variant={campaign.status === "active" ? "default" : campaign.status === "scheduled" ? "secondary" : "outline"}>
                        {campaign.status}
                      </Badge>
                    </div>

                    {campaign.status === "active" || campaign.status === "completed" ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Open Rate</span>
                          <span className="font-medium text-foreground">{Number(campaign.open_rate || 0).toFixed(1)}%</span>
                        </div>
                        <Progress value={Number(campaign.open_rate || 0)} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Click Rate</span>
                          <span className="font-medium text-foreground">{Number(campaign.click_rate || 0).toFixed(1)}%</span>
                        </div>
                        <Progress value={Number(campaign.click_rate || 0) * 3} className="h-2" />
                      </div>
                    ) : null}

                    <div className="mt-3 text-xs text-muted-foreground">
                      {campaign.sent_at
                        ? `Sent ${formatDistanceToNow(new Date(campaign.sent_at), { addSuffix: true })}`
                        : campaign.scheduled_at
                          ? `Scheduled for ${format(new Date(campaign.scheduled_at), "MMM d, h:mm a")}`
                          : `Created ${formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}`}
                    </div>

                    <div className="mt-4 border-t border-border/60 pt-4">
                      {openScheduleId === campaign.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <Input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
                            <Input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleSaveReschedule(campaign.id)}
                              disabled={updateCampaign.isPending || !rescheduleDate || !rescheduleTime}
                            >
                              {updateCampaign.isPending ? "Saving..." : "Save"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setOpenScheduleId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleOpenReschedule(campaign.id, campaign.scheduled_at)}>
                          <Clock className="mr-1 h-3.5 w-3.5" />
                          {campaign.scheduled_at ? "Reschedule" : "Schedule"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No campaigns yet" description="Create your first campaign to start building audience momentum." />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
