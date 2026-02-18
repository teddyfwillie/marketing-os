import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useCompetitors() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["competitors", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("competitors")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAddCompetitor() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ name, url }: { name: string; url: string }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase
        .from("competitors")
        .insert({
          organization_id: profile.organization_id,
          name,
          url,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      toast({ title: "Competitor added", description: "Ready for analysis." });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add competitor",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useScrapeCompetitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ competitorId, url }: { competitorId: string; url: string }) => {
      const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url, competitorId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Update competitor with scraped data
      const { error: updateError } = await supabase
        .from("competitors")
        .update({
          status: "analyzed",
          scraped_data: data.data,
          last_scanned_at: new Date().toISOString(),
          content_count: data.data?.links?.length || 0,
        })
        .eq("id", competitorId);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      toast({ title: "Analysis complete", description: "Competitor data updated." });
    },
    onError: (error: Error) => {
      toast({
        title: "Scraping failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAnalyzeCompetitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      competitorId,
      competitorName,
      competitorUrl,
      scrapedMarkdown,
    }: {
      competitorId: string;
      competitorName: string;
      competitorUrl: string;
      scrapedMarkdown: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("analyze-competitor", {
        body: { competitorId, competitorName, competitorUrl, scrapedMarkdown },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const { error: updateError } = await supabase
        .from("competitors")
        .update({ ai_analysis: data.analysis } as never)
        .eq("id", competitorId);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      toast({ title: "Analysis complete", description: "AI insights generated successfully." });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCompetitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (competitorId: string) => {
      const { error } = await supabase
        .from("competitors")
        .delete()
        .eq("id", competitorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
      toast({ title: "Competitor removed" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
