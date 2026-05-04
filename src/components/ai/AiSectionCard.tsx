import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiSectionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  loading?: boolean;
  hasResults?: boolean;
  onGenerate?: () => void;
  children?: ReactNode;
  /** Hide the generate button (e.g. when section uses its own form) */
  hideCta?: boolean;
}

export function AiSectionCard({
  icon: Icon,
  title,
  subtitle,
  ctaLabel = "Generate with AI",
  loading,
  hasResults,
  onGenerate,
  children,
  hideCta,
}: AiSectionCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-primary-sm shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-1.5">
              {title}
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
        {!hideCta && onGenerate && (
          <Button
            size="sm"
            onClick={onGenerate}
            disabled={loading}
            className={cn("gap-2 shrink-0", hasResults ? "" : "glow-primary")}
            variant={hasResults ? "outline" : "default"}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {loading ? "Generating…" : hasResults ? "Regenerate" : ctaLabel}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
