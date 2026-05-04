import { cn } from "@/lib/utils";

interface SerpPreviewProps {
  url: string;
  title: string;
  description: string;
  variant?: "before" | "after";
}

function urlToBreadcrumb(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return [u.hostname, ...parts].join(" › ");
  } catch {
    return url;
  }
}

export function SerpPreview({ url, title, description, variant = "after" }: SerpPreviewProps) {
  const isBefore = variant === "before";
  return (
    <div
      className={cn(
        "rounded-lg border p-4 bg-white text-left",
        isBefore ? "border-border/40 opacity-70" : "border-primary/30 ring-1 ring-primary/20"
      )}
      style={{ fontFamily: "arial, sans-serif" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-[9px] text-gray-500 font-bold">
            {(() => {
              try {
                return new URL(url).hostname[0]?.toUpperCase() || "?";
              } catch {
                return "?";
              }
            })()}
          </span>
        </div>
        <p className="text-[11px] text-gray-700 truncate">{urlToBreadcrumb(url)}</p>
      </div>
      <h4
        className="text-[18px] leading-snug truncate"
        style={{ color: isBefore ? "#7e7e7e" : "#1a0dab" }}
      >
        {title || <span className="italic text-gray-400">(no title)</span>}
      </h4>
      <p
        className="text-[13px] leading-snug mt-1 line-clamp-2"
        style={{ color: isBefore ? "#9aa0a6" : "#4d5156" }}
      >
        {description || <span className="italic text-gray-400">(no description)</span>}
      </p>
    </div>
  );
}

export function BeforeAfterSerp({
  url,
  before,
  after,
}: {
  url: string;
  before: { title: string; description: string };
  after: { title: string; description: string };
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Before</p>
        <SerpPreview url={url} title={before.title} description={before.description} variant="before" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-primary mb-1.5">After (AI)</p>
        <SerpPreview url={url} title={after.title} description={after.description} variant="after" />
      </div>
    </div>
  );
}
