## Goal

Extend the Agent 00Seo report with **four on-demand AI sections** powered by Lovable AI (google/gemini-3-flash-preview). Each section is triggered by its own "Generate" button, uses the actual scraped page data (so suggestions are contextual, never generic), and only flags things the user is **missing or doing poorly** — not stuff already correct.

## New sections in the report (all on-demand)

1. **Smart Fix Suggestions** — for each detected issue, replaces the generic recommendation with a personalized, ready-to-paste fix based on the actual page content.
2. **Conversion Booster** — rewrites the hero/title/subtitle into 3 catchy, attention-grabbing variants tuned to the page's topic.
3. **SEO Content Rewrites** — proposes improved meta title, meta description, and H1 — only for fields that are missing, too short, too long, or weak.
4. **Product Draft Generator** — small form (product idea + optional context) → returns name, slug, and SEO-optimized description. Uses the scanned site as brand/voice context.

Each section:
- Shows a "Generate with AI" button when collapsed.
- Streams or loads results into a styled card (matches dark/teal glass aesthetic).
- Has a copy-to-clipboard button on every output.
- Surfaces 429/402 errors as friendly toasts.

## Backend (new Lovable Cloud edge functions)

All call the Lovable AI gateway via `LOVABLE_API_KEY` (already auto-provisioned). Default model: `google/gemini-3-flash-preview`. Use **tool calling** for structured JSON output (cleaner than asking the model for JSON).

1. **`ai-smart-fixes`** — input: list of detected issues + scraped page context (title, description, h1, url). Output: `{ fixes: [{ issueId, personalizedFix, example }] }`. Prompt instructs model to only suggest fixes for things actually broken, no generic advice.
2. **`ai-conversion-rewrite`** — input: current title/h1/description + page topic. Output: `{ variants: [{ headline, subheadline, angle }] }` (3 variants).
3. **`ai-seo-rewrite`** — input: scraped page + list of weak/missing SEO fields. Output: `{ metaTitle?, metaDescription?, h1? }` — only fills fields that need improvement; skips fields already good.
4. **`ai-product-draft`** — input: `{ idea, brandContext }`. Output: `{ name, slug, description, altNames[] }`.

All four follow the standard pattern: CORS, validate input with Zod, handle 429/402 from the gateway, return structured JSON.

## Frontend changes

- **`src/components/SeoReport.tsx`**: add four new collapsible sections below the existing categories. Each has its own loading/empty/result state.
- **New components** (small, focused):
  - `src/components/ai/SmartFixesPanel.tsx`
  - `src/components/ai/ConversionBoosterPanel.tsx`
  - `src/components/ai/SeoRewritePanel.tsx`
  - `src/components/ai/ProductDraftPanel.tsx`
  - `src/components/ai/AiSectionCard.tsx` — shared shell (header, generate button, loading skeleton, copy button).
- **`src/pages/Index.tsx`**: pass the full `report` (which already includes scraped signals) into `SeoReport` so panels have context. No flow change — initial UX (URL → loader → report) stays the same.

## Edge function → page-context wiring

The existing `run-seo-agent` already extracts title, description, h1s, url. Extend its returned `Report` with a small `pageContext` object: `{ title, metaDescription, h1, topic, url }`. The AI panels send this to each AI function so output is grounded in the user's actual page.

## Technical notes

- Model: `google/gemini-3-flash-preview` (fast, cheap, default).
- Use **tool calling** with a strict JSON schema for each function — avoids parsing free-text JSON.
- Non-streaming `supabase.functions.invoke()` is fine for these (short outputs).
- All four functions deploy with default `verify_jwt = false` — no `config.toml` changes needed.
- Memory will be updated to reflect the new AI capabilities and the "only flag what's actually missing" constraint.

## Out of scope (for this round)

- Saving generated content to a database (no auth yet).
- Streaming token-by-token UI (can add later if outputs feel slow).
- The Render API integration — fully replaced by Lovable AI per your choice.

## Files touched

- New: `supabase/functions/ai-smart-fixes/index.ts`, `ai-conversion-rewrite/index.ts`, `ai-seo-rewrite/index.ts`, `ai-product-draft/index.ts`
- New: 5 components under `src/components/ai/`
- Edited: `src/components/SeoReport.tsx`, `src/pages/Index.tsx`, `supabase/functions/run-seo-agent/index.ts` (add `pageContext` to response)
- Memory: update index + add a `features/ai-panels` memory file
