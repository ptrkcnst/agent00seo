import { Loader2 } from "lucide-react";

const steps = [
  "Fetching your page…",
  "Inspecting meta tags & headings…",
  "Checking performance & structured data…",
  "Calculating your SEO score…",
];

export function LoadingSpinner() {
  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 glow-primary">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
        <div className="space-y-3 text-center">
          <p className="text-sm font-medium text-foreground">Auditing your site…</p>
          <div className="space-y-1.5">
            {steps.map((step, i) => (
              <p
                key={step}
                className="text-xs text-muted-foreground animate-fade-in-up"
                style={{ animationDelay: `${i * 0.3}s`, opacity: 0 }}
              >
                {step}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
