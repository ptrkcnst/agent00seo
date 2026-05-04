import { Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CrawlPage {
  url: string;
  score: number;
  grade: string;
  critical: number;
  warnings: number;
  passed: number;
  title: string;
  status: number;
  error?: string;
}

export function CrawlResults({ pages }: { pages: CrawlPage[] }) {
  if (!pages || pages.length === 0) return null;
  const avg = Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length);
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Other pages on this site
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            We crawled {pages.length} additional internal page{pages.length === 1 ? "" : "s"} · Average score {avg}
          </p>
        </div>
        <div className={cn("text-2xl font-bold", avg >= 80 ? "text-success" : avg >= 60 ? "text-warning" : "text-destructive")}>
          {avg}
        </div>
      </div>
      <div className="space-y-2">
        {pages.map((p) => {
          const scoreColor = p.score >= 80 ? "text-success" : p.score >= 60 ? "text-warning" : "text-destructive";
          return (
            <div key={p.url} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3 hover:bg-muted/30 transition-colors">
              <div className={cn("flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md", p.score >= 80 ? "bg-success/10" : p.score >= 60 ? "bg-warning/10" : "bg-destructive/10")}>
                <span className={cn("text-sm font-bold leading-none", scoreColor)}>{p.score}</span>
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground mt-0.5">{p.grade}</span>
              </div>
              <div className="flex-1 min-w-0">
                {p.title && <p className="text-sm font-medium text-foreground truncate">{p.title}</p>}
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary truncate flex items-center gap-1">
                  <span className="truncate">{p.url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                {p.error ? (
                  <p className="text-[10px] text-destructive mt-0.5">{p.error}</p>
                ) : (
                  <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                    {p.critical > 0 && <span className="text-destructive">{p.critical} critical</span>}
                    {p.warnings > 0 && <span className="text-warning">{p.warnings} warnings</span>}
                    <span className="text-success">{p.passed} passed</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
