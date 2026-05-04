import { useState } from "react";
import { ChevronDown, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Platform } from "./PlatformPicker";

const PLATFORM_LABEL: Record<Platform, string> = {
  wordpress: "WordPress",
  shopify: "Shopify",
  webflow: "Webflow",
  wix: "Wix",
  lovable: "Lovable",
  nextjs: "Next.js / React",
  html: "Plain HTML",
  other: "your platform",
};

export function PlatformSteps({ steps, platform }: { steps: string[]; platform: Platform }) {
  const [open, setOpen] = useState(false);
  if (!steps || steps.length === 0) return null;
  return (
    <div className="mt-3 rounded-md border border-border bg-background/40 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30 transition-colors"
      >
        <ListChecks className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">
          How to apply this in {PLATFORM_LABEL[platform]}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground ml-auto transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ol className="px-4 pb-3 pt-1 space-y-1.5 list-decimal list-inside text-xs text-foreground/85 animate-fade-in-up">
          {steps.map((s, i) => (
            <li key={i} className="leading-relaxed">{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
