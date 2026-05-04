import { useState } from "react";
import { Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AiSectionCard } from "./AiSectionCard";
import { CopyButton } from "./CopyButton";
import { PlatformSteps } from "./PlatformSteps";
import { FeedbackButtons } from "./FeedbackButtons";
import type { Platform } from "./PlatformPicker";

interface Issue { id: string; title: string; description: string; severity: string; }
interface Fix { issueId: string; personalizedFix: string; example: string; implementationSteps: string[]; }
interface PageContext { url: string; title: string; metaDescription: string; h1: string; topic: string; }

export function SmartFixesPanel({
  issues,
  pageContext,
  platform,
}: {
  issues: Issue[];
  pageContext: PageContext;
  platform: Platform;
}) {
  const [loading, setLoading] = useState(false);
  const [fixes, setFixes] = useState<Fix[] | null>(null);

  const realIssues = issues.filter(i => i.severity !== "good");

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-smart-fixes", {
        body: { issues: realIssues, pageContext, platform },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setFixes(data.fixes || []);
    } catch (e) {
      toast({ title: "Couldn't generate fixes", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AiSectionCard
      icon={Wrench}
      title="Smart Fix Suggestions"
      subtitle={`Personalized fixes for the ${realIssues.length} issue${realIssues.length === 1 ? "" : "s"} we found, with step-by-step instructions for your platform`}
      loading={loading}
      hasResults={!!fixes}
      onGenerate={generate}
    >
      {realIssues.length === 0 && (
        <p className="text-sm text-muted-foreground">No issues to fix — your page passed every check. 🎉</p>
      )}
      {fixes && fixes.length > 0 && (
        <div className="space-y-3 mt-2">
          {fixes.map((f) => {
            const issue = issues.find(i => i.id === f.issueId);
            return (
              <div key={f.issueId} className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wider text-primary mb-1">{issue?.title || f.issueId}</p>
                <p className="text-sm text-foreground/90">{f.personalizedFix}</p>
                {f.example && (
                  <div className="mt-3 rounded-md bg-background/60 border border-border/60 p-3 relative">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Ready to paste</p>
                    <pre className="text-xs text-foreground/85 whitespace-pre-wrap break-words font-mono">{f.example}</pre>
                    <div className="absolute top-2 right-2"><CopyButton text={f.example} /></div>
                  </div>
                )}
                <PlatformSteps steps={f.implementationSteps || []} platform={platform} />
                <div className="mt-3 flex justify-end">
                  <FeedbackButtons
                    section="smart_fix"
                    itemKey={f.issueId}
                    pageUrl={pageContext.url}
                    context={{ platform, issueTitle: issue?.title }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AiSectionCard>
  );
}
