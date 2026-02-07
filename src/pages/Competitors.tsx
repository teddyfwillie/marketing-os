import { useState } from "react";
import {
  Users,
  Plus,
  Globe,
  TrendingUp,
  FileText,
  RefreshCw,
  ExternalLink,
  Trash2,
  Radar,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCompetitors, useAddCompetitor, useScrapeCompetitor, useDeleteCompetitor } from "@/hooks/useCompetitors";
import { formatDistanceToNow } from "date-fns";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/common/EmptyState";

export default function Competitors() {
  const { toast } = useToast();
  const { data: competitors, isLoading } = useCompetitors();
  const addCompetitor = useAddCompetitor();
  const scrapeCompetitor = useScrapeCompetitor();
  const deleteCompetitor = useDeleteCompetitor();

  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newCompetitorUrl, setNewCompetitorUrl] = useState("");

  const handleAddCompetitor = async () => {
    if (!newCompetitorUrl.trim()) {
      toast({ title: "Please enter a URL", description: "Enter a competitor website URL to analyze.", variant: "destructive" });
      return;
    }

    const name = newCompetitorName.trim() || new URL(`https://${newCompetitorUrl.replace(/^https?:\/\//, "")}`).hostname;

    await addCompetitor.mutateAsync({ name, url: newCompetitorUrl.trim() });
    setNewCompetitorName("");
    setNewCompetitorUrl("");
  };

  const handleScrape = async (competitorId: string, url: string) => {
    await scrapeCompetitor.mutateAsync({ competitorId, url });
  };

  const insights =
    competitors
      ?.filter((c) => c.status === "analyzed" && c.scraped_data)
      .slice(0, 3)
      .map((c) => ({
        title: `${c.name} analyzed`,
        description: `Found ${c.content_count || 0} indexed links and content signals`,
        time: c.last_scanned_at ? formatDistanceToNow(new Date(c.last_scanned_at), { addSuffix: true }) : "Recently",
      })) || [];

  return (
    <AppLayout title="Competitors" subtitle="Monitor rivals and turn intel into campaign actions.">
      <PageHero
        eyebrow="Intel"
        title="Competitor signal center"
        description="Track competitor changes, refresh scans, and spot gaps you can exploit."
        icon={Radar}
      />

      <div className="stagger-fade grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="app-surface rounded-2xl border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-primary" />
              Add Competitor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name (optional)</Label>
              <Input placeholder="Competitor name" value={newCompetitorName} onChange={(e) => setNewCompetitorName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input placeholder="competitor.com" value={newCompetitorUrl} onChange={(e) => setNewCompetitorUrl(e.target.value)} />
            </div>
            <Button className="w-full gap-2" onClick={handleAddCompetitor} disabled={addCompetitor.isPending}>
              {addCompetitor.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Competitor
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">We scan key pages and surface strategic signals.</p>
          </CardContent>
        </Card>

        <Card className="app-surface rounded-2xl border-border/70 bg-card/80 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              Tracked Competitors
            </CardTitle>
            <Badge variant="secondary">{competitors?.length || 0} tracked</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading competitors...</p>
            ) : competitors && competitors.length > 0 ? (
              <div className="space-y-4">
                {competitors.map((competitor) => (
                  <div key={competitor.id} className="rounded-xl border border-border/70 bg-muted/30 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-muted p-2">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{competitor.name}</h3>
                          <a
                            href={`https://${competitor.url.replace(/^https?:\/\//, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            {competitor.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={competitor.status === "analyzed" ? "default" : "secondary"}>{competitor.status}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => deleteCompetitor.mutate(competitor.id)} disabled={deleteCompetitor.isPending}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {competitor.status === "analyzed" ? (
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-lg font-bold text-foreground">{competitor.traffic_estimate || "-"}</p>
                          <p className="text-xs text-muted-foreground">Traffic</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-lg font-bold text-foreground">{competitor.content_count || 0}</p>
                          <p className="text-xs text-muted-foreground">Content</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-lg font-bold text-foreground">{competitor.social_followers || "-"}</p>
                          <p className="text-xs text-muted-foreground">Followers</p>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {competitor.last_scanned_at
                          ? `Last scanned ${formatDistanceToNow(new Date(competitor.last_scanned_at), { addSuffix: true })}`
                          : "Not scanned yet"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleScrape(competitor.id, competitor.url)}
                        disabled={scrapeCompetitor.isPending}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${scrapeCompetitor.isPending ? "animate-spin" : ""}`} />
                        {competitor.status === "pending" ? "Analyze" : "Rescan"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No competitors yet" description="Add a competitor URL to start collecting market signals." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="stagger-fade app-surface rounded-2xl border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            Latest Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {insights.map((insight) => (
                <div key={insight.title} className="rounded-xl border border-border/70 bg-muted/30 p-4">
                  <p className="font-semibold text-foreground">{insight.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{insight.time}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FileText} title="No insights yet" description="Run analysis on competitors to unlock insights here." />
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
