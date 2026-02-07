import { useState } from "react";
import {
  FileText,
  Sparkles,
  Copy,
  RefreshCw,
  BookOpen,
  MessageSquare,
  Megaphone,
  Mail,
  Trash2,
  Clock,
  Calendar,
  WandSparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateContent, useDeleteContent, useGeneratedContent } from "@/hooks/useGeneratedContent";
import { useCreateSocialPost } from "@/hooks/useSocialPosts";
import { useCreateEmailCampaign } from "@/hooks/useEmailCampaigns";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { formatDistanceToNow } from "date-fns";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/common/EmptyState";

const contentTypes = [
  { value: "blog", label: "Blog Post", icon: BookOpen },
  { value: "social", label: "Social Media", icon: MessageSquare },
  { value: "ad", label: "Ad Copy", icon: Megaphone },
  { value: "email", label: "Email", icon: Mail },
] as const;

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "persuasive", label: "Persuasive" },
] as const;

type ContentType = (typeof contentTypes)[number]["value"];
type ToneType = (typeof toneOptions)[number]["value"];
type PlatformType = Database["public"]["Enums"]["social_platform"];

const socialPlatforms: PlatformType[] = ["twitter", "instagram", "linkedin", "facebook"];

type SavedItem = {
  id: string;
  title: string | null;
  prompt: string | null;
  content: string;
  content_type: ContentType;
  tone: ToneType;
  created_at: string;
};

export default function ContentCreator() {
  const { toast } = useToast();
  const { data: savedContent, isLoading: isLoadingSavedContent } = useGeneratedContent();
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();
  const createSocialPost = useCreateSocialPost();
  const createEmailCampaign = useCreateEmailCampaign();

  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [tone, setTone] = useState<ToneType>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [socialDialogItem, setSocialDialogItem] = useState<SavedItem | null>(null);
  const [emailDialogItem, setEmailDialogItem] = useState<SavedItem | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(["twitter"]);
  const [socialScheduleDate, setSocialScheduleDate] = useState("");
  const [socialScheduleTime, setSocialScheduleTime] = useState("");
  const [emailScheduleDate, setEmailScheduleDate] = useState("");
  const [emailScheduleTime, setEmailScheduleTime] = useState("");
  const [emailAudience, setEmailAudience] = useState("all");
  const [emailName, setEmailName] = useState("");
  const [emailSubject, setEmailSubject] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Describe what content you'd like to create.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { prompt, contentType, tone },
      });
      if (error) throw error;

      const content =
        data?.content ||
        `# ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Content\n\nGenerated content for: "${prompt}"\n\nWritten in a ${tone} tone, optimized for ${contentType} format.`;

      setGeneratedContent(content);
      toast({ title: "Content generated", description: "Review and edit before publishing." });
    } catch {
      const fallback = `# ${contentType} content about "${prompt}"\n\nGenerated in a ${tone} tone.\n\nConfigure AI gateway for richer results.`;
      setGeneratedContent(fallback);
      toast({ title: "Content generated", description: "Fallback draft created." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;

    await createContent.mutateAsync({
      contentType,
      tone,
      prompt,
      content: generatedContent,
      title: prompt.substring(0, 100),
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  const handleLoadSavedContent = (item: {
    content: string;
    content_type: ContentType;
    tone: ToneType;
    prompt: string | null;
  }) => {
    setGeneratedContent(item.content);
    setContentType(item.content_type);
    setTone(item.tone);
    setPrompt(item.prompt || "");
  };

  const togglePlatform = (platform: PlatformType) => {
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]));
  };

  const handleOpenSocialScheduler = (item: SavedItem) => {
    setSocialDialogItem(item);
    setSelectedPlatforms(["twitter"]);
    setSocialScheduleDate("");
    setSocialScheduleTime("");
  };

  const handleOpenEmailScheduler = (item: SavedItem) => {
    setEmailDialogItem(item);
    setEmailScheduleDate("");
    setEmailScheduleTime("");
    setEmailAudience("all");
    const baseTitle = item.title || item.prompt || "Generated Content Campaign";
    setEmailName(baseTitle.slice(0, 80));
    setEmailSubject(baseTitle.slice(0, 100));
  };

  const handleScheduleSocial = async () => {
    if (!socialDialogItem || selectedPlatforms.length === 0 || !socialScheduleDate || !socialScheduleTime) {
      toast({ title: "Missing details", description: "Choose platforms, date, and time.", variant: "destructive" });
      return;
    }

    const scheduledAt = new Date(`${socialScheduleDate}T${socialScheduleTime}`).toISOString();
    await createSocialPost.mutateAsync({
      content: socialDialogItem.content,
      platforms: selectedPlatforms,
      scheduledAt,
      status: "scheduled",
    });
    setSocialDialogItem(null);
  };

  const handleScheduleEmail = async () => {
    if (!emailDialogItem || !emailScheduleDate || !emailScheduleTime || !emailName.trim()) {
      toast({ title: "Missing details", description: "Enter campaign name, date, and time.", variant: "destructive" });
      return;
    }

    const scheduledAt = new Date(`${emailScheduleDate}T${emailScheduleTime}`).toISOString();
    await createEmailCampaign.mutateAsync({
      name: emailName.trim(),
      subject: emailSubject.trim() || emailDialogItem.title || "Generated content",
      content: emailDialogItem.content,
      audience: emailAudience,
      scheduledAt,
      status: "scheduled",
    });
    setEmailDialogItem(null);
  };

  return (
    <AppLayout title="Content Studio" subtitle="Generate, refine, and schedule high-performing marketing assets.">
      <PageHero
        eyebrow="AI Workflow"
        title="From idea to publish-ready"
        description="Draft content quickly, iterate on tone, then push to social or email in one flow."
        icon={WandSparkles}
      />

      <div className="stagger-fade grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Create Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {contentTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={contentType === type.value ? "default" : "outline"}
                    className="h-auto flex-col gap-1 py-3"
                    onClick={() => setContentType(type.value)}
                  >
                    <type.icon className="h-4 w-4" />
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as ToneType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea
                placeholder="Describe your topic, value proposition, and target audience..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[160px] resize-none"
              />
            </div>

            <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Draft
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Output
            </CardTitle>
            {generatedContent ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave} disabled={createContent.isPending}>
                  {createContent.isPending ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="secondary">{contentType}</Badge>
                  <Badge variant="outline">{tone}</Badge>
                </div>
                <Textarea value={generatedContent} onChange={(e) => setGeneratedContent(e.target.value)} className="min-h-[430px] font-mono text-sm" />
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No generated draft yet"
                description="Generate content and your draft will appear here for editing."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="stagger-fade app-surface rounded-2xl border-border/70 bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-primary" />
            Saved Content
          </CardTitle>
          <Badge variant="secondary">{savedContent?.length || 0} total</Badge>
        </CardHeader>
        <CardContent>
          {isLoadingSavedContent ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading saved content...</p>
          ) : savedContent && savedContent.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {savedContent.map((item) => (
                <div key={item.id} className="flex h-full flex-col justify-between gap-4 rounded-xl border border-border/70 bg-muted/25 p-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">{item.title || item.prompt || "Untitled content"}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{item.content_type}</Badge>
                      <Badge variant="secondary">{item.tone}</Badge>
                      <Badge variant="outline">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</Badge>
                    </div>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{item.content}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenSocialScheduler(item as SavedItem)}>
                      <Calendar className="mr-1 h-4 w-4" />
                      Schedule Social
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEmailScheduler(item as SavedItem)}>
                      <Mail className="mr-1 h-4 w-4" />
                      Schedule Email
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleLoadSavedContent(item)}>
                      Open
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteContent.mutate(item.id)} disabled={deleteContent.isPending}>
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No saved content yet"
              description="Generate content and save your best drafts to build a reusable library."
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={!!socialDialogItem} onOpenChange={(open) => !open && setSocialDialogItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Social Post</DialogTitle>
            <DialogDescription>Schedule this content for selected channels.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {socialPlatforms.map((platform) => (
                  <Button
                    key={platform}
                    type="button"
                    variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={socialScheduleDate} onChange={(e) => setSocialScheduleDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={socialScheduleTime} onChange={(e) => setSocialScheduleTime(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={handleScheduleSocial} disabled={createSocialPost.isPending}>
              {createSocialPost.isPending ? "Scheduling..." : "Schedule Social Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!emailDialogItem} onOpenChange={(open) => !open && setEmailDialogItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Email Campaign</DialogTitle>
            <DialogDescription>Use this content as an email campaign draft.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input value={emailName} onChange={(e) => setEmailName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={emailAudience} onValueChange={setEmailAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers</SelectItem>
                  <SelectItem value="new">New Subscribers (Last 30 days)</SelectItem>
                  <SelectItem value="engaged">Engaged Users</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={emailScheduleDate} onChange={(e) => setEmailScheduleDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={emailScheduleTime} onChange={(e) => setEmailScheduleTime(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={handleScheduleEmail} disabled={createEmailCampaign.isPending}>
              {createEmailCampaign.isPending ? "Scheduling..." : "Schedule Campaign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
