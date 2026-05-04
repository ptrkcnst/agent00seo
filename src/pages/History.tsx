import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, RotateCcw, History as HistoryIcon, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AuditRow {
  id: string;
  url: string;
  score: number;
  grade: string;
  summary: string | null;
  created_at: string;
}

export default function History() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("audits")
      .select("id, url, score, grade, summary, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Couldn't load history", description: error.message, variant: "destructive" });
    setAudits(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("audits").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else setAudits(a => a.filter(x => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-[linear-gradient(hsl(var(--muted)/0.5)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.5)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="relative mx-auto max-w-3xl px-4 py-10">
        <AppHeader />

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2"><HistoryIcon className="h-5 w-5 text-primary" /> Audit history</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Every site you've audited, ready to re-open or re-run.</p>
          </div>
          <Button onClick={() => nav("/")} variant="outline" size="sm" className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> New audit
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : audits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="text-sm text-muted-foreground">No audits yet — run your first one!</p>
            <Button onClick={() => nav("/")} className="mt-4 glow-primary">Start an audit</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {audits.map(a => {
              const scoreColor = a.score >= 80 ? "text-success" : a.score >= 60 ? "text-warning" : "text-destructive";
              const scoreBg = a.score >= 80 ? "bg-success/10 border-success/30" : a.score >= 60 ? "bg-warning/10 border-warning/30" : "bg-destructive/10 border-destructive/30";
              return (
                <div key={a.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 hover:border-primary/40 transition-colors">
                  <div className={cn("flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border", scoreBg)}>
                    <span className={cn("text-lg font-bold leading-none", scoreColor)}>{a.score}</span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{a.grade}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-foreground hover:text-primary truncate flex items-center gap-1">
                      {a.url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.summary}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={() => nav(`/?audit=${a.id}`)}>
                      <Eye className="h-3.5 w-3.5" /> Open
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove(a.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <AppFooter />
      </div>
    </div>
  );
}
