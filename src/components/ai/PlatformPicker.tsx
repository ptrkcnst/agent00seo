import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

export type Platform =
  | "wordpress"
  | "shopify"
  | "webflow"
  | "wix"
  | "lovable"
  | "nextjs"
  | "html"
  | "other";

const OPTIONS: { id: Platform; label: string }[] = [
  { id: "wordpress", label: "WordPress" },
  { id: "shopify", label: "Shopify" },
  { id: "webflow", label: "Webflow" },
  { id: "wix", label: "Wix" },
  { id: "lovable", label: "Lovable" },
  { id: "nextjs", label: "Next.js / React" },
  { id: "html", label: "Plain HTML" },
  { id: "other", label: "Other" },
];

const STORAGE_KEY = "agent00seo:platform";

export function getStoredPlatform(): Platform | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? (v as Platform) : null;
  } catch {
    return null;
  }
}

export function PlatformPicker({
  value,
  onChange,
  detected,
}: {
  value: Platform;
  onChange: (p: Platform) => void;
  detected?: Platform | null;
}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const handle = (p: Platform) => {
    onChange(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch { /* ignore */ }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Your platform</p>
            <p className="text-[11px] text-muted-foreground">
              {detected && detected !== "other"
                ? `We detected ${OPTIONS.find(o => o.id === detected)?.label}. Change if wrong.`
                : "So we can tailor the steps to where you click."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:ml-auto">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => handle(o.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium border transition-all",
                value === o.id
                  ? "bg-primary text-primary-foreground border-primary glow-primary-sm"
                  : "bg-muted/30 text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
              )}
            >
              {o.label}
              {hydrated && detected === o.id && value !== o.id && (
                <span className="ml-1 text-[9px] uppercase opacity-60">detected</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
