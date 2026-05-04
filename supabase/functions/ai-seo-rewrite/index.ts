import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { pageContext, weakFields } = await req.json();
    if (!pageContext || !Array.isArray(weakFields)) {
      return new Response(JSON.stringify({ error: "pageContext and weakFields[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (weakFields.length === 0) {
      return new Response(JSON.stringify({ message: "All SEO fields look good — no rewrites needed.", rewrites: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an SEO copywriter. Rewrite ONLY the fields listed as weak/missing — leave everything else alone. Use the actual page topic and content. Follow strict length rules:
- metaTitle: 50-60 characters
- metaDescription: 140-160 characters
- h1: clear, keyword-rich, max ~70 characters
Never invent product features. Be specific and benefit-led.`;

    const userPrompt = `Page context:
URL: ${pageContext.url}
Current title: ${pageContext.title || "(missing)"}
Current meta description: ${pageContext.metaDescription || "(missing)"}
Current H1: ${pageContext.h1 || "(missing)"}
Topic: ${pageContext.topic || "(unknown)"}

Fields to rewrite (only these): ${weakFields.join(", ")}`;

    const properties: Record<string, unknown> = {};
    if (weakFields.includes("metaTitle")) properties.metaTitle = { type: "string" };
    if (weakFields.includes("metaDescription")) properties.metaDescription = { type: "string" };
    if (weakFields.includes("h1")) properties.h1 = { type: "string" };

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
            name: "return_rewrites",
            description: "Return improved SEO content for weak fields only",
            parameters: {
              type: "object",
              properties: {
                rewrites: { type: "object", properties, additionalProperties: false, required: weakFields },
                rationale: { type: "string", description: "1-2 sentence explanation of the choices" },
              },
              required: ["rewrites", "rationale"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_rewrites" } },
      }),
    });

    if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!response.ok) {
      console.error("ai-seo-rewrite", response.status, await response.text());
      throw new Error("AI gateway error");
    }
    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { rewrites: {}, rationale: "" };
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ai-seo-rewrite error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
