import { AlertTriangle, AlertCircle, Info, CheckCircle2, ChevronDown, RotateCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SmartFixesPanel } from "@/components/ai/SmartFixesPanel";
import { ConversionBoosterPanel } from "@/components/ai/ConversionBoosterPanel";
import { SeoRewritePanel } from "@/components/ai/SeoRewritePanel";
import { ProductDraftPanel } from "@/components/ai/ProductDraftPanel";
import { PlatformPicker, getStoredPlatform, type Platform } from "@/components/ai/PlatformPicker";

type Severity = "critical" | "warning" | "info" | "good";

interface Issue {
  id: string;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  severity: Severity;
  impact: number;
}

export interface PageContext {
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  topic: string;
}

export interface Report {
  url: string;
  score: number;
  grade: string;
  summary: string;
  stats: { critical: number; warnings: number; passed: number };
  categories: { name: string; score: number; issues: Issue[] }[];
  pageContext: PageContext;
  weakSeoFields: string[];
  detectedPlatform?: string;
}

const severityMeta: Record<Severity, { icon: typeof AlertTriangle; label: string; color: string; bg: string; ring: string }> = {
  critical: { icon: AlertCircle, label: "Critical", color: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30" },
  warning: { icon: AlertTriangle, label: "Warning", color: "text-warning", bg: "bg-warning/10", ring: "ring-warning/30" },
  info: { icon: Info, label: "Info", color: "text-primary", bg: "bg-primary/10", ring: "ring-primary/30" },
  good: { icon: CheckCircle2, label: "Passed", color: "text-success", bg: "bg-success/10", ring: "ring-success/30" },
};

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "hsl(var(--success))" : score >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        <circle cx="90" cy="90" r={radius} stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
        <circle
          cx="90" cy="90" r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s ease-out", filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-foreground">{score}</span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Grade {grade}</span>
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState(issue.severity === "critical");
  const meta = severityMeta[issue.severity];
  const Icon = meta.icon;

  return (
    <div className={cn("rounded-lg border border-border bg-muted/20 overflow-hidden transition-all", open && "ring-1", open && meta.ring)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.bg)}>
          <Icon className={cn("h-4 w-4", meta.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-foreground">{issue.title}</h4>
            <span className={cn("text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded", meta.bg, meta.color)}>
              {meta.label}
            </span>
          </div>
          {issue.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{issue.description}</p>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform mt-1", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 pb-4 pl-16 space-y-3 animate-fade-in-up">
          {issue.description && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">What we found</p>
              <p className="text-sm text-foreground/85">{issue.description}</p>
            </div>
          )}
          {issue.recommendation && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">How to fix</p>
              <p className="text-sm text-foreground/85">{issue.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const VALID_PLATFORMS: Platform[] = ["wordpress", "shopify", "webflow", "wix", "lovable", "nextjs", "html", "other"];

export function SeoReport({ report, onReset }: { report: Report; onReset: () => void }) {
  const scoreColor = report.score >= 80 ? "text-success" : report.score >= 60 ? "text-warning" : "text-destructive";

  const detected = (VALID_PLATFORMS.includes(report.detectedPlatform as Platform)
    ? report.detectedPlatform
    : null) as Platform | null;

  const [platform, setPlatform] = useState<Platform>(() => {
    return getStoredPlatform() ?? detected ?? "other";
  });

  // If user hasn't picked one yet, follow detected when a new report arrives.
  useEffect(() => {
    if (!getStoredPlatform() && detected) setPlatform(detected);
  }, [detected]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <ScoreGauge score={report.score} grade={report.grade} />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">SEO Audit</p>
              <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 break-all">
                {report.url}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
            <p className={cn("text-sm font-medium", scoreColor)}>{report.summary}</p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-2xl font-bold text-destructive">{report.stats.critical}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Critical</p>
              </div>
              <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                <p className="text-2xl font-bold text-warning">{report.stats.warnings}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Warnings</p>
              </div>
              <div className="rounded-lg bg-success/10 border border-success/20 p-3">
                <p className="text-2xl font-bold text-success">{report.stats.passed}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Passed</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            Analyze another site
          </Button>
        </div>
      </div>

      {/* Categories */}
      {report.categories.map((cat) => {
        const open = cat.issues.filter(i => i.severity !== "good");
        const passed = cat.issues.filter(i => i.severity === "good");
        return (
          <div key={cat.name} className="rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {open.length} issue{open.length === 1 ? "" : "s"} · {passed.length} passed
                </p>
              </div>
              <div className={cn(
                "text-2xl font-bold",
                cat.score >= 80 ? "text-success" : cat.score >= 60 ? "text-warning" : "text-destructive"
              )}>
                {cat.score}
              </div>
            </div>
            <div className="space-y-2">
              {[...open, ...passed].map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        );
      })}

      {/* AI-powered sections */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-border" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">AI-powered actions</p>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>

      {(() => {
        const allIssues = report.categories.flatMap(c => c.issues);
        return (
          <>
            <SmartFixesPanel issues={allIssues} pageContext={report.pageContext} />
            <SeoRewritePanel pageContext={report.pageContext} weakFields={report.weakSeoFields} />
            <ConversionBoosterPanel pageContext={report.pageContext} />
            <ProductDraftPanel pageContext={report.pageContext} />
          </>
        );
      })()}
    </div>
  );
}
