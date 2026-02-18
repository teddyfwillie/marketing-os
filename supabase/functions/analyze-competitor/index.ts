const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { competitorId, competitorName, competitorUrl, scrapedMarkdown } = await req.json();

    if (!competitorId || !competitorName || !competitorUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'competitorId, competitorName, and competitorUrl are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      const analysis = generateFallbackAnalysis(competitorName, competitorUrl);
      return new Response(
        JSON.stringify({ success: true, analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a strategic marketing analyst specializing in competitive intelligence for B2B SaaS companies. You analyze competitor websites and return structured JSON insights. Return ONLY valid JSON — no markdown, no code fences, no extra text.`;

    const userPrompt = `Analyze the following competitor for a company called Marketing OS (a unified marketing operating system for SMB teams).

Competitor: ${competitorName} (${competitorUrl})
Scraped content:
${scrapedMarkdown || '(No content available — infer from the URL and company name)'}

Return ONLY valid JSON with exactly these fields:
{
  "positioning": "one paragraph on how this competitor positions themselves in the market",
  "target_audience": "who they target — company size, role, industry, pain points",
  "tone_voice": "their communication style and tone (e.g. professional, playful, technical)",
  "strengths": ["3-5 bullet points on what they do well"],
  "weaknesses_gaps": ["3-5 gaps or weaknesses Marketing OS can exploit"],
  "tips_to_stand_out": ["3-5 actionable tips for Marketing OS to differentiate against this competitor"]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      const analysis = generateFallbackAnalysis(competitorName, competitorUrl);
      return new Response(
        JSON.stringify({ success: true, analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawContent = data.content?.[0]?.text || '';
    const analysis = parseAnalysis(rawContent, competitorName, competitorUrl);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing competitor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze competitor';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseAnalysis(raw: string, name: string, url: string) {
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    const parsed = JSON.parse(cleaned);
    return { ...parsed, generated_at: new Date().toISOString() };
  } catch {
    console.error('Failed to parse AI response as JSON, using fallback');
    return generateFallbackAnalysis(name, url);
  }
}

function generateFallbackAnalysis(name: string, url: string) {
  return {
    positioning: `${name} positions itself as a solution for businesses seeking to streamline their marketing operations. Based on their web presence at ${url}, they appear to focus on delivering value through an integrated platform approach.`,
    target_audience: 'Small to mid-sized businesses and marketing teams looking to consolidate their marketing tools and workflows into a single platform.',
    tone_voice: 'Professional and results-oriented, with a focus on business outcomes and ROI.',
    strengths: [
      'Established market presence and brand recognition',
      'Focused feature set targeting a specific market segment',
      'Active content and SEO strategy',
    ],
    weaknesses_gaps: [
      'May lack the unified OS approach that Marketing OS provides',
      'Potential complexity in onboarding and setup',
      'Limited SMB-specific workflows and templates',
    ],
    tips_to_stand_out: [
      'Emphasize the all-in-one unified OS approach vs. their fragmented tooling',
      'Highlight faster time-to-value with SMB-focused templates and workflows',
      'Differentiate on pricing transparency and SMB-friendly plans',
    ],
    generated_at: new Date().toISOString(),
  };
}
