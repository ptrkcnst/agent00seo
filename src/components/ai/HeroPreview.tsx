import { ArrowRight } from "lucide-react";

export function HeroPreview({ headline, subheadline }: { headline: string; subheadline: string }) {
  return (
    <div className="rounded-lg border border-border bg-gradient-to-br from-background to-muted/40 p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_60%)] pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-4">
          <div className="h-2 w-2 rounded-full bg-destructive/60" />
          <div className="h-2 w-2 rounded-full bg-warning/60" />
          <div className="h-2 w-2 rounded-full bg-success/60" />
          <div className="ml-2 h-1 w-16 rounded-full bg-border" />
        </div>
        <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight">
          {headline}
        </h3>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {subheadline}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold">
          Get started
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
