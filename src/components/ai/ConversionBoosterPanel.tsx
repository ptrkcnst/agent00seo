import { useState } from "react";
import { Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AiSectionCard } from "./AiSectionCard";
import { CopyButton } from "./CopyButton";
import { HeroPreview } from "./HeroPreview";

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
      subtitle="3 catchy hero rewrites — see how each one would look in your page hero"
      loading={loading}
      hasResults={!!variants}
      onGenerate={generate}
    >
      {variants && variants.length > 0 && (
        <div className="grid gap-4 mt-2 lg:grid-cols-3">
          {variants.map((v, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-primary">{v.angle}</span>
                <CopyButton text={`${v.headline}\n\n${v.subheadline}`} />
              </div>
              <HeroPreview headline={v.headline} subheadline={v.subheadline} />
            </div>
          ))}
        </div>
      )}
    </AiSectionCard>
  );
}
