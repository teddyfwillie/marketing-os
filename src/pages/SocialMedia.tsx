import { ChangeEvent, useRef, useState } from "react";
import {
  Plus,
  Calendar,
  Clock,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Image as ImageIcon,
  Send,
  Megaphone,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSocialPosts, useCreateSocialPost } from "@/hooks/useSocialPosts";
import { Database } from "@/integrations/supabase/types";
import { format, formatDistanceToNow } from "date-fns";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PlatformType = Database["public"]["Enums"]["social_platform"];

const platforms = [
  { id: "twitter" as PlatformType, name: "Twitter", icon: Twitter },
  { id: "instagram" as PlatformType, name: "Instagram", icon: Instagram },
  { id: "linkedin" as PlatformType, name: "LinkedIn", icon: Linkedin },
  { id: "facebook" as PlatformType, name: "Facebook", icon: Facebook },
];

export default function SocialMedia() {
  const { data: posts, isLoading } = useSocialPosts();
  const createPost = useCreateSocialPost();
  const { toast } = useToast();

  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(["twitter"]);
  const [postContent, setPostContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const togglePlatform = (platformId: PlatformType) => {
    setSelectedPlatforms((prev) => (prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]));
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId);
    if (!platform) return null;
    const Icon = platform.icon;
    return <Icon className="h-3.5 w-3.5" />;
  };

  const handleSchedulePost = async () => {
    if (!postContent.trim() || selectedPlatforms.length === 0) return;

    let scheduledAt: string | undefined;
    if (scheduledDate && scheduledTime) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    await createPost.mutateAsync({
      content: postContent,
      platforms: selectedPlatforms,
      scheduledAt,
      status: scheduledAt ? "scheduled" : "draft",
      mediaFiles,
    });

    setPostContent("");
    setScheduledDate("");
    setScheduledTime("");
    setMediaFiles([]);
  };

  const handlePostNow = async () => {
    if (!postContent.trim() || selectedPlatforms.length === 0) return;

    await createPost.mutateAsync({
      content: postContent,
      platforms: selectedPlatforms,
      status: "published",
      mediaFiles,
    });

    setPostContent("");
    setMediaFiles([]);
  };

  const addMediaFiles = (incomingFiles: File[]) => {
    if (!incomingFiles.length) return;
    const imageFiles = incomingFiles.filter((file) => file.type.startsWith("image/"));
    setMediaFiles((prev) => [...prev, ...imageFiles]);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    addMediaFiles(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEnhanceWithAi = async () => {
    if (!postContent.trim()) {
      toast({ title: "Post content required", description: "Write a draft first.", variant: "destructive" });
      return;
    }

    setIsEnhancing(true);
    try {
      const prompt = `Improve this social media post for ${selectedPlatforms.join(", ")}. Keep it concise, add a strong hook and CTA, and preserve core meaning:\n\n${postContent}`;
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { prompt, contentType: "social", tone: "persuasive" },
      });
      if (error) throw error;
      const improved = data?.content?.trim();
      if (!improved) throw new Error("No content returned");
      setPostContent(improved);
      toast({ title: "Post enhanced" });
    } catch {
      toast({ title: "AI enhancement failed", description: "Unable to enhance post right now.", variant: "destructive" });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <AppLayout title="Social Media" subtitle="Plan and publish channel-ready content with timing control.">
      <PageHero
        eyebrow="Distribution"
        title="Social planning board"
        description="Compose once, adapt per channel, and keep your posting cadence consistent."
        icon={Megaphone}
      />

      <div className="stagger-fade grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="app-surface rounded-2xl border-border/70 bg-card/80 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-primary" />
              Create New Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <Button
                    key={platform.id}
                    variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => togglePlatform(platform.id)}
                  >
                    <platform.icon className="h-4 w-4" />
                    {platform.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Post Content</Label>
              <Textarea
                placeholder="What would you like to share?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[170px] resize-none"
              />
              <Button type="button" variant="outline" className="w-full gap-2" onClick={handleEnhanceWithAi} disabled={isEnhancing || !postContent.trim()}>
                {isEnhancing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isEnhancing ? "Enhancing..." : "Enhance with AI"}
              </Button>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{postContent.length} characters</span>
                <span>Tip: keep first sentence punchy</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Media</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
              <div
                className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  addMediaFiles(Array.from(event.dataTransfer.files || []));
                }}
              >
                <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drag and drop images or click to upload</p>
              </div>
              {mediaFiles.length ? (
                <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3">
                  {mediaFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 text-sm text-foreground">
                      <span className="truncate">{file.name}</span>
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeMediaFile(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 gap-2" onClick={handleSchedulePost} disabled={createPost.isPending || !postContent.trim()}>
                <Calendar className="h-4 w-4" />
                {createPost.isPending ? "Saving..." : "Schedule Post"}
              </Button>
              <Button variant="outline" className="gap-2" onClick={handlePostNow} disabled={createPost.isPending || !postContent.trim()}>
                <Send className="h-4 w-4" />
                Post Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-primary" />
              Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Loading posts...</p>
            ) : posts && posts.length > 0 ? (
              posts.slice(0, 6).map((post) => (
                <div key={post.id} className="rounded-xl border border-border/70 bg-muted/30 p-3">
                  <div className="mb-2 flex items-start gap-2">
                    {post.platforms.map((p) => (
                      <span key={p} className="rounded bg-muted px-1.5 py-1 text-muted-foreground">
                        {getPlatformIcon(p)}
                      </span>
                    ))}
                    <Badge
                      variant={post.status === "scheduled" ? "default" : post.status === "published" ? "secondary" : "outline"}
                      className="ml-auto text-[11px]"
                    >
                      {post.status}
                    </Badge>
                  </div>
                  <p className="mb-2 line-clamp-2 text-sm text-foreground">{post.content}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.scheduled_at
                        ? format(new Date(post.scheduled_at), "MMM d")
                        : formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                    {post.scheduled_at ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(post.scheduled_at), "h:mm a")}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No posts yet" description="Create your first post to start filling your schedule." />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
