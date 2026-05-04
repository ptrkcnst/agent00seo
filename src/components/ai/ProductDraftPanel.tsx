import { useState } from "react";
import { Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AiSectionCard } from "./AiSectionCard";
import { CopyButton } from "./CopyButton";

interface PageContext { url: string; title: string; metaDescription: string; h1: string; topic: string; }
interface Draft { name: string; slug: string; description: string; altNames: string[]; }

export function ProductDraftPanel({ pageContext }: { pageContext: PageContext }) {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const generate = async () => {
    if (!idea.trim()) {
      toast({ title: "Add a product idea first", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-product-draft", {
        body: { idea: idea.trim(), brandContext: pageContext },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setDraft(data);
    } catch (e) {
      toast({ title: "Couldn't generate draft", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AiSectionCard
      icon={Package}
      title="Product Draft Generator"
      subtitle="Generate name, slug and SEO-ready description in your brand voice"
      hideCta
    >
      <div className="space-y-3">
        <div>
          <Label htmlFor="product-idea" className="text-xs text-muted-foreground">Product idea</Label>
          <Textarea
            id="product-idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. A premium ceramic pour-over coffee dripper for at-home baristas"
            className="mt-1 min-h-[80px] bg-muted/50 border-border"
          />
        </div>
        <Button onClick={generate} disabled={loading} className="gap-2 glow-primary">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? "Generating draft…" : draft ? "Regenerate" : "Generate draft"}
        </Button>

        {draft && (
          <div className="space-y-3 pt-2">
            <div className="rounded-lg border border-border bg-muted/20 p-4 relative">
              <p className="text-[10px] uppercase tracking-wider text-primary mb-1">Product name</p>
              <p className="text-base font-semibold text-foreground pr-16">{draft.name}</p>
              <div className="absolute top-2 right-2"><CopyButton text={draft.name} /></div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4 relative">
              <p className="text-[10px] uppercase tracking-wider text-primary mb-1">Slug</p>
              <p className="text-sm font-mono text-foreground/90 pr-16">{draft.slug}</p>
              <div className="absolute top-2 right-2"><CopyButton text={draft.slug} /></div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4 relative">
              <p className="text-[10px] uppercase tracking-wider text-primary mb-1">Description ({draft.description.length} chars)</p>
              <p className="text-sm text-foreground/90 pr-16 whitespace-pre-wrap">{draft.description}</p>
              <div className="absolute top-2 right-2"><CopyButton text={draft.description} /></div>
            </div>
            {draft.altNames?.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-[10px] uppercase tracking-wider text-primary mb-2">Alternative names</p>
                <div className="flex flex-wrap gap-2">
                  {draft.altNames.map((n, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AiSectionCard>
  );
}
