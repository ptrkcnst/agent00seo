import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Severity = "critical" | "warning" | "info" | "good";

interface Issue {
  id: string;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  severity: Severity;
  impact: number; // 1-10
}

interface PageContext {
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  topic: string;
}

interface AnalysisReport {
  url: string;
  score: number;
  grade: string;
  summary: string;
  stats: {
    critical: number;
    warnings: number;
    passed: number;
  };
  categories: {
    name: string;
    score: number;
    issues: Issue[];
  }[];
  pageContext: PageContext;
  weakSeoFields: string[];
}

function normalizeUrl(input: string): string {
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}

async function fetchSite(url: string): Promise<{ html: string; status: number; finalUrl: string; headers: Headers } | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Agent00SeoBot/1.0; +https://lovable.dev)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    const html = await res.text();
    return { html, status: res.status, finalUrl: res.url, headers: res.headers };
  } catch (e) {
    console.error("fetchSite failed", e);
    return null;
  }
}

function pick(html: string, regex: RegExp): string | null {
  const m = html.match(regex);
  return m ? (m[1] ?? m[0]) : null;
}

function pickAll(html: string, regex: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  while ((m = r.exec(html)) !== null) {
    out.push(m[1] ?? m[0]);
  }
  return out;
}

function analyze(url: string, html: string, status: number, headers: Headers): AnalysisReport {
  const issues: Issue[] = [];
  const passed: Issue[] = [];

  const title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i)?.trim() ?? "";
  const metaDescription = pick(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) ?? "";
  const h1s = pickAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).map(s => s.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
  const h2s = pickAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const imgs = pickAll(html, /<img\b([^>]*)>/i);
  const imgsMissingAlt = imgs.filter(attrs => !/\balt\s*=/.test(attrs));
  const canonical = pick(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const viewport = pick(html, /<meta[^>]+name=["']viewport["']/i);
  const ogTitle = pick(html, /<meta[^>]+property=["']og:title["']/i);
  const ogImage = pick(html, /<meta[^>]+property=["']og:image["']/i);
  const twitterCard = pick(html, /<meta[^>]+name=["']twitter:card["']/i);
  const langAttr = pick(html, /<html[^>]+lang=["']([^"']+)["']/i);
  const jsonLd = pickAll(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i);
  const isHttps = url.startsWith("https://");
  const htmlSize = html.length;
  const hasFavicon = /<link[^>]+rel=["'](?:shortcut )?icon["']/i.test(html);
  const hasRobotsNoindex = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);

  // Helpers
  const add = (i: Issue) => issues.push(i);
  const ok = (i: Issue) => passed.push(i);

  // === Title ===
  if (!title) {
    add({ id: "title-missing", category: "On-Page", title: "Missing page title", description: "No <title> tag was found on the page.", recommendation: "Add a unique, descriptive <title> tag (50–60 characters).", severity: "critical", impact: 10 });
  } else if (title.length < 30) {
    add({ id: "title-short", category: "On-Page", title: "Title is too short", description: `Your title is ${title.length} characters: “${title}”.`, recommendation: "Expand the title to 50–60 characters with primary keywords.", severity: "warning", impact: 6 });
  } else if (title.length > 65) {
    add({ id: "title-long", category: "On-Page", title: "Title may be truncated", description: `Title is ${title.length} characters and may get cut off in search results.`, recommendation: "Keep the title under 60 characters.", severity: "warning", impact: 5 });
  } else {
    ok({ id: "title-ok", category: "On-Page", title: "Title length is optimal", description: `“${title}” (${title.length} chars).`, recommendation: "Keep monitoring CTR.", severity: "good", impact: 0 });
  }

  // === Meta description ===
  if (!metaDescription) {
    add({ id: "desc-missing", category: "On-Page", title: "Missing meta description", description: "No meta description was found.", recommendation: "Add a compelling meta description (140–160 characters).", severity: "critical", impact: 9 });
  } else if (metaDescription.length < 70) {
    add({ id: "desc-short", category: "On-Page", title: "Meta description is too short", description: `Description is ${metaDescription.length} characters.`, recommendation: "Aim for 140–160 characters with a clear value proposition.", severity: "warning", impact: 5 });
  } else if (metaDescription.length > 165) {
    add({ id: "desc-long", category: "On-Page", title: "Meta description may be truncated", description: `Description is ${metaDescription.length} characters.`, recommendation: "Trim it to under 160 characters.", severity: "warning", impact: 4 });
  } else {
    ok({ id: "desc-ok", category: "On-Page", title: "Meta description is well-sized", description: `${metaDescription.length} characters.`, recommendation: "", severity: "good", impact: 0 });
  }

  // === Headings ===
  if (h1s.length === 0) {
    add({ id: "h1-missing", category: "Content", title: "Missing H1 heading", description: "No <h1> tag was detected on the page.", recommendation: "Add exactly one descriptive H1 with the main keyword.", severity: "critical", impact: 8 });
  } else if (h1s.length > 1) {
    add({ id: "h1-multiple", category: "Content", title: `Multiple H1 tags (${h1s.length})`, description: "Multiple H1 tags can dilute topical focus.", recommendation: "Use one H1 per page; downgrade extras to H2.", severity: "warning", impact: 5 });
  } else {
    ok({ id: "h1-ok", category: "Content", title: "Single H1 detected", description: `“${h1s[0].slice(0, 80)}”.`, recommendation: "", severity: "good", impact: 0 });
  }
  if (h2s.length === 0) {
    add({ id: "h2-missing", category: "Content", title: "No H2 subheadings", description: "Subheadings improve readability and topical structure.", recommendation: "Break content into sections with H2/H3 headings.", severity: "info", impact: 3 });
  } else {
    ok({ id: "h2-ok", category: "Content", title: `${h2s.length} subheadings detected`, description: "", recommendation: "", severity: "good", impact: 0 });
  }

  // === Images alt ===
  if (imgs.length > 0 && imgsMissingAlt.length > 0) {
    const sev: Severity = imgsMissingAlt.length / imgs.length > 0.3 ? "warning" : "info";
    add({ id: "img-alt", category: "Accessibility", title: `${imgsMissingAlt.length} of ${imgs.length} images missing alt text`, description: "Alt text helps screen readers and image search ranking.", recommendation: "Add descriptive alt attributes to all meaningful images.", severity: sev, impact: 5 });
  } else if (imgs.length > 0) {
    ok({ id: "img-alt-ok", category: "Accessibility", title: "All images have alt text", description: `${imgs.length} images checked.`, recommendation: "", severity: "good", impact: 0 });
  }

  // === Canonical ===
  if (!canonical) {
    add({ id: "canonical-missing", category: "Technical", title: "Missing canonical tag", description: "Canonical tags prevent duplicate content issues.", recommendation: "Add <link rel=\"canonical\" href=\"...\"> to the <head>.", severity: "warning", impact: 6 });
  } else {
    ok({ id: "canonical-ok", category: "Technical", title: "Canonical tag present", description: canonical, recommendation: "", severity: "good", impact: 0 });
  }

  // === Viewport / mobile ===
  if (!viewport) {
    add({ id: "viewport", category: "Mobile", title: "Missing viewport meta tag", description: "Without a viewport meta, the page won't be mobile-friendly.", recommendation: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.", severity: "critical", impact: 9 });
  } else {
    ok({ id: "viewport-ok", category: "Mobile", title: "Viewport configured", description: "", recommendation: "", severity: "good", impact: 0 });
  }

  // === Social ===
  if (!ogTitle || !ogImage) {
    add({ id: "og-missing", category: "Social", title: "Open Graph tags incomplete", description: `Missing: ${[!ogTitle && "og:title", !ogImage && "og:image"].filter(Boolean).join(", ")}.`, recommendation: "Add og:title, og:description and og:image for richer social shares.", severity: "warning", impact: 4 });
  } else {
    ok({ id: "og-ok", category: "Social", title: "Open Graph configured", description: "", recommendation: "", severity: "good", impact: 0 });
  }
  if (!twitterCard) {
    add({ id: "twitter-missing", category: "Social", title: "Missing Twitter Card", description: "Twitter Cards improve previews on X/Twitter.", recommendation: "Add <meta name=\"twitter:card\" content=\"summary_large_image\">.", severity: "info", impact: 2 });
  }

  // === Lang ===
  if (!langAttr) {
    add({ id: "lang", category: "Accessibility", title: "Missing <html lang> attribute", description: "Helps search engines and screen readers identify language.", recommendation: "Set lang on the <html> tag, e.g. <html lang=\"en\">.", severity: "warning", impact: 3 });
  } else {
    ok({ id: "lang-ok", category: "Accessibility", title: `Language set to “${langAttr}”`, description: "", recommendation: "", severity: "good", impact: 0 });
  }

  // === Structured data ===
  if (jsonLd.length === 0) {
    add({ id: "schema", category: "Technical", title: "No structured data (JSON-LD) found", description: "Schema.org markup unlocks rich results in Google.", recommendation: "Add JSON-LD for Organization, Product, Article or BreadcrumbList.", severity: "warning", impact: 6 });
  } else {
    ok({ id: "schema-ok", category: "Technical", title: `${jsonLd.length} JSON-LD block(s) detected`, description: "", recommendation: "", severity: "good", impact: 0 });
  }

  // === HTTPS ===
  if (!isHttps) {
    add({ id: "https", category: "Technical", title: "Site not served over HTTPS", description: "HTTPS is a confirmed Google ranking factor.", recommendation: "Install an SSL certificate and redirect HTTP → HTTPS.", severity: "critical", impact: 10 });
  } else {
    ok({ id: "https-ok", category: "Technical", title: "HTTPS enabled", description: "", recommendation: "", severity: "good", impact: 0 });
  }

  // === Robots noindex ===
  if (hasRobotsNoindex) {
    add({ id: "noindex", category: "Technical", title: "Page is set to noindex", description: "This page explicitly tells search engines not to index it.", recommendation: "Remove the noindex directive if you want this page ranked.", severity: "critical", impact: 10 });
  }

  // === Page size / performance proxy ===
  if (htmlSize > 500_000) {
    add({ id: "size", category: "Performance", title: "Large HTML payload", description: `HTML is ${(htmlSize / 1024).toFixed(0)} KB — may slow first paint.`, recommendation: "Reduce inline scripts/styles and lazy-load non-critical content.", severity: "warning", impact: 5 });
  } else {
    ok({ id: "size-ok", category: "Performance", title: `HTML size healthy (${(htmlSize / 1024).toFixed(0)} KB)`, description: "", recommendation: "", severity: "good", impact: 0 });
  }

  // === Favicon ===
  if (!hasFavicon) {
    add({ id: "favicon", category: "Branding", title: "Missing favicon", description: "Favicons reinforce branding in browser tabs and search results.", recommendation: "Add <link rel=\"icon\" href=\"/favicon.ico\">.", severity: "info", impact: 1 });
  }

  // === Status ===
  if (status >= 400) {
    add({ id: "status", category: "Technical", title: `HTTP ${status} response`, description: "The page returned an error status code.", recommendation: "Investigate server logs and fix routing.", severity: "critical", impact: 10 });
  }

  // === Score ===
  const totalImpact = issues.reduce((s, i) => s + i.impact, 0);
  const score = Math.max(0, Math.min(100, 100 - totalImpact * 1.6));
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";

  const critical = issues.filter(i => i.severity === "critical").length;
  const warnings = issues.filter(i => i.severity === "warning").length;

  // Group by category
  const all = [...issues, ...passed];
  const categoryNames = Array.from(new Set(all.map(i => i.category)));
  const categories = categoryNames.map(name => {
    const items = all.filter(i => i.category === name);
    const catIssues = items.filter(i => i.severity !== "good");
    const catImpact = catIssues.reduce((s, i) => s + i.impact, 0);
    const catScore = Math.max(0, Math.min(100, 100 - catImpact * 4));
    return { name, score: Math.round(catScore), issues: items };
  }).sort((a, b) => a.score - b.score);

  const summary = critical > 0
    ? `Found ${critical} critical issue${critical === 1 ? "" : "s"} that need immediate attention.`
    : warnings > 0
      ? `${warnings} warning${warnings === 1 ? "" : "s"} found. Quick wins available.`
      : "Your site looks great! Keep monitoring for new issues.";

  // Derive a topic guess from title/h1
  const topic = (title || h1s[0] || "").slice(0, 120);

  const weakSeoFields: string[] = [];
  if (!title || title.length < 30 || title.length > 65) weakSeoFields.push("metaTitle");
  if (!metaDescription || metaDescription.length < 70 || metaDescription.length > 165) weakSeoFields.push("metaDescription");
  if (h1s.length === 0 || h1s.length > 1) weakSeoFields.push("h1");

  return {
    url,
    score: Math.round(score),
    grade,
    summary,
    stats: { critical, warnings, passed: passed.length },
    categories,
    pageContext: {
      url,
      title,
      metaDescription,
      h1: h1s[0] || "",
      topic,
    },
    weakSeoFields,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "A website URL is required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const finalUrl = normalizeUrl(url);
    const fetched = await fetchSite(finalUrl);
    if (!fetched) {
      return new Response(JSON.stringify({ error: "Could not reach the site. Double-check the URL." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const report = analyze(finalUrl, fetched.html, fetched.status, fetched.headers);
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("run-seo-agent error", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
