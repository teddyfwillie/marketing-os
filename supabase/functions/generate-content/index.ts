const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, contentType, tone } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      // Fallback content when AI is not configured
      const fallbackContent = generateFallbackContent(prompt, contentType, tone);
      return new Response(
        JSON.stringify({ success: true, content: fallbackContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert marketing content writer. Generate ${contentType} content with a ${tone} tone. Be creative, engaging, and professional. Format the output appropriately for the content type.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create ${contentType} content about: ${prompt}` },
        ],
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('AI Gateway error:', data);
      const fallbackContent = generateFallbackContent(prompt, contentType, tone);
      return new Response(
        JSON.stringify({ success: true, content: fallbackContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = data.choices?.[0]?.message?.content || generateFallbackContent(prompt, contentType, tone);

    return new Response(
      JSON.stringify({ success: true, content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateFallbackContent(prompt: string, contentType: string, tone: string): string {
  const templates: Record<string, string> = {
    blog: `# ${prompt}

## Introduction
This blog post explores the key aspects of ${prompt}. Written in a ${tone} tone, it provides valuable insights for your audience.

## Key Points
1. **Understanding the Basics** - Start with the fundamentals
2. **Best Practices** - Industry-standard approaches
3. **Tips for Success** - Actionable advice

## Conclusion
Implement these strategies to see real results in your marketing efforts.

---
*Connect the Lovable AI Gateway for AI-powered content generation.*`,
    
    social: `📢 ${prompt}

🔥 Key takeaways:
• Point 1
• Point 2
• Point 3

💡 Ready to learn more? Check the link in bio!

#Marketing #Growth #Business`,
    
    ad: `🚀 ${prompt}

✅ Benefit 1
✅ Benefit 2
✅ Benefit 3

👉 Act now and transform your results!

[CTA Button]`,
    
    email: `Subject: ${prompt}

Hi [Name],

${prompt} - here's what you need to know.

Key highlights:
- Important point 1
- Important point 2
- Important point 3

Best regards,
Your Marketing Team`,
  };

  return templates[contentType] || templates.blog;
}
