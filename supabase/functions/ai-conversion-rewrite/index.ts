import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  // Security headers (defense-in-depth on JSON API responses)
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { pageContext } = await req.json();
    if (!pageContext) {
      return new Response(JSON.stringify({ error: "pageContext required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a world-class direct-response copywriter. Rewrite the user's hero headline + subheadline to maximize attention and conversions. Generate 3 distinct variants, each with a different angle (e.g. benefit-led, curiosity, urgency, social-proof, problem/solution). Stay grounded in their actual product/topic — do not invent features.`;

    const userPrompt = `Site URL: ${pageContext.url}
Current title: ${pageContext.title || "(none)"}
Current H1: ${pageContext.h1 || "(none)"}
Current meta description: ${pageContext.metaDescription || "(none)"}
Topic: ${pageContext.topic || "(unknown)"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_variants",
            description: "Return 3 hero copy variants",
            parameters: {
              type: "object",
              properties: {
                variants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      headline: { type: "string", description: "Catchy hero headline, max ~10 words" },
                      subheadline: { type: "string", description: "Supporting line, 1-2 sentences" },
                      angle: { type: "string", description: "Short label like 'Benefit-led', 'Curiosity', etc." },
                    },
                    required: ["headline", "subheadline", "angle"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["variants"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_variants" } },
      }),
    });

    if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!response.ok) {
      console.error("ai-conversion-rewrite", response.status, await response.text());
      throw new Error("AI gateway error");
    }
    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { variants: [] };
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ai-conversion-rewrite error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
