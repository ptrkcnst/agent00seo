import { useState } from "react";
import { Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AiSectionCard } from "./AiSectionCard";
import { CopyButton } from "./CopyButton";

interface PageContext { url: string; title: string; metaDescription: string; h1: string; topic: string; }
interface Variant { headline: string; subheadline: string; angle: string; }

export function ConversionBoosterPanel({ pageContext }: { pageContext: PageContext }) {
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[] | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-conversion-rewrite", { body: { pageContext } });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setVariants(data.variants || []);
    } catch (e) {
      toast({ title: "Couldn't generate copy", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AiSectionCard
      icon={Rocket}
      title="Conversion Booster"
      subtitle="3 catchy hero rewrites tuned to grab attention and lift conversions"
      loading={loading}
      hasResults={!!variants}
      onGenerate={generate}
    >
      {variants && variants.length > 0 && (
        <div className="grid gap-3 mt-2 md:grid-cols-3">
          {variants.map((v, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/20 p-4 flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-primary mb-2">{v.angle}</span>
              <h4 className="text-sm font-semibold text-foreground leading-snug">{v.headline}</h4>
              <p className="text-xs text-muted-foreground mt-2 flex-1">{v.subheadline}</p>
              <div className="mt-3 -mx-1">
                <CopyButton text={`${v.headline}\n\n${v.subheadline}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </AiSectionCard>
  );
}
