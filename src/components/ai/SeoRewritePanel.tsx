import { useState } from "react";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AiSectionCard } from "./AiSectionCard";
import { CopyButton } from "./CopyButton";

interface PageContext { url: string; title: string; metaDescription: string; h1: string; topic: string; }
interface Rewrites { metaTitle?: string; metaDescription?: string; h1?: string; }

const FIELD_LABELS: Record<string, string> = {
  metaTitle: "Meta title",
  metaDescription: "Meta description",
  h1: "H1 heading",
};

export function SeoRewritePanel({ pageContext, weakFields }: { pageContext: PageContext; weakFields: string[] }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ rewrites: Rewrites; rationale: string } | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-seo-rewrite", { body: { pageContext, weakFields } });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setResult({ rewrites: data.rewrites || {}, rationale: data.rationale || "" });
    } catch (e) {
      toast({ title: "Couldn't generate rewrites", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AiSectionCard
      icon={FileText}
      title="SEO Content Rewrites"
      subtitle={
        weakFields.length === 0
          ? "Your title, description and H1 all look healthy — no rewrites needed."
          : `Rewriting ${weakFields.length} field${weakFields.length === 1 ? "" : "s"} that need improvement: ${weakFields.map(f => FIELD_LABELS[f]).join(", ")}`
      }
      loading={loading}
      hasResults={!!result}
      onGenerate={weakFields.length > 0 ? generate : undefined}
      hideCta={weakFields.length === 0}
    >
      {result && (
        <div className="space-y-3 mt-2">
          {(Object.entries(result.rewrites) as [keyof Rewrites, string][]).map(([key, value]) => value && (
            <div key={key} className="rounded-lg border border-border bg-muted/20 p-4 relative">
              <p className="text-[10px] uppercase tracking-wider text-primary mb-1">{FIELD_LABELS[key]} ({value.length} chars)</p>
              <p className="text-sm text-foreground/90 pr-16">{value}</p>
              <div className="absolute top-2 right-2"><CopyButton text={value} /></div>
            </div>
          ))}
          {result.rationale && (
            <p className="text-xs text-muted-foreground italic">{result.rationale}</p>
          )}
        </div>
      )}
    </AiSectionCard>
  );
}
