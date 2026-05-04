import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { issues, pageContext, platform } = await req.json();
    if (!Array.isArray(issues) || !pageContext) {
      return new Response(JSON.stringify({ error: "issues[] and pageContext required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const trimmedIssues = issues.slice(0, 12).map((i: any) => ({
      id: i.id, title: i.title, description: i.description, severity: i.severity,
    }));

    const PLATFORM_LABELS: Record<string, string> = {
      wordpress: "WordPress (Yoast/Rank Math SEO plugin assumed for meta fields)",
      shopify: "Shopify (admin dashboard, theme editor)",
      webflow: "Webflow (Designer + page settings)",
      wix: "Wix (editor + SEO panel)",
      lovable: "Lovable (edits via the Lovable AI editor and index.html)",
      nextjs: "Next.js / React (metadata API, app/layout.tsx, head tags)",
      html: "Plain HTML (edit the page's <head> and body directly)",
      other: "a generic CMS/website builder",
    };
    const platformLabel = PLATFORM_LABELS[platform] || PLATFORM_LABELS.other;

    const systemPrompt = `You are an elite SEO consultant. For each REAL issue found on the user's page, write a personalized, specific, ready-to-paste fix using the actual page context (title, h1, URL, topic).
RULES:
- ONLY address issues actually present in the input — never invent generic advice.
- Each fix must reference the user's specific page (their topic, brand, or content).
- Provide an EXAMPLE the user can paste directly (e.g. exact title text, exact meta description string, exact HTML snippet).
- Provide implementationSteps: 3-6 SHORT numbered steps describing exactly where to click in ${platformLabel} to apply the fix. Use the platform's real menu names. No code in steps — code goes in 'example'.
- Be concise. No fluff, no "you should consider" wording.`;

    const userPrompt = `Platform: ${platformLabel}

Page context:
URL: ${pageContext.url}
Title: ${pageContext.title || "(missing)"}
Meta description: ${pageContext.metaDescription || "(missing)"}
H1: ${pageContext.h1 || "(missing)"}
Detected topic: ${pageContext.topic || "(unknown)"}

Issues to fix:
${trimmedIssues.map((i: any, idx: number) => `${idx + 1}. [${i.id}] ${i.title} — ${i.description}`).join("\n")}`;

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
            name: "return_fixes",
            description: "Return personalized fixes for the issues",
            parameters: {
              type: "object",
              properties: {
                fixes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      issueId: { type: "string" },
                      personalizedFix: { type: "string", description: "1-2 sentence fix tailored to the page" },
                      example: { type: "string", description: "Ready-to-paste example (text or code)" },
                      implementationSteps: {
                        type: "array",
                        items: { type: "string" },
                        description: "3-6 short numbered steps for the user's platform. No code.",
                      },
                    },
                    required: ["issueId", "personalizedFix", "example", "implementationSteps"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["fixes"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_fixes" } },
      }),
    });

    if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!response.ok) {
      const t = await response.text();
      console.error("ai-smart-fixes gateway error", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { fixes: [] };
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ai-smart-fixes error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
