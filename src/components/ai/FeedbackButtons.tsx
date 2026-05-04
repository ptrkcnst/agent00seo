import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Section = "smart_fix" | "seo_rewrite" | "conversion_variant" | "product_draft";
type Vote = "up" | "down";

interface Props {
  section: Section;
  itemKey: string;
  pageUrl?: string;
  context?: Record<string, unknown>;
  className?: string;
}

export function FeedbackButtons({ section, itemKey, pageUrl, context, className }: Props) {
  const [vote, setVote] = useState<Vote | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (next: Vote) => {
    if (vote === next || submitting) return;
    setSubmitting(true);
    const previous = vote;
    setVote(next);
    try {
      const { error } = await (supabase.from("ai_feedback") as any).insert({
        section,
        item_key: itemKey,
        vote: next,
        page_url: pageUrl ?? null,
        context: context ?? null,
      });
      if (error) throw error;
    } catch (e) {
      setVote(previous);
      toast({
        title: "Couldn't save feedback",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">Helpful?</span>
      <button
        type="button"
        aria-label="Thumbs up"
        disabled={submitting}
        onClick={() => submit("up")}
        className={cn(
          "h-7 w-7 inline-flex items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground transition-colors",
          "hover:text-success hover:border-success/40 hover:bg-success/10",
          vote === "up" && "text-success border-success/50 bg-success/15"
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Thumbs down"
        disabled={submitting}
        onClick={() => submit("down")}
        className={cn(
          "h-7 w-7 inline-flex items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground transition-colors",
          "hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10",
          vote === "down" && "text-destructive border-destructive/50 bg-destructive/15"
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
