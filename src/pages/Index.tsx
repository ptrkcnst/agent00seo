import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { SeoReport, type Report } from "@/components/SeoReport";
import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, Globe, Layers } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const [website, setWebsite] = useState("");
  const [crawlSite, setCrawlSite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [report, setReport] = useState<Report | null>(null);

  // Load saved audit from history (?audit=ID)
  useEffect(() => {
    const id = params.get("audit");
    if (!id || !user) return;
    setIsLoading(true);
    supabase.from("audits").select("report, crawl, url").eq("id", id).eq("user_id", user.id).maybeSingle().then(({ data, error }) => {
      setIsLoading(false);
      if (error || !data) {
        setApiError("Couldn't load that audit.");
        return;
      }
      const rep = data.report as unknown as Report;
      if (data.crawl) (rep as Report).crawl = data.crawl as unknown as Report["crawl"];
      setReport(rep);
      setWebsite(data.url);
    });
  }, [params, user]);

  const saveAudit = async (rep: Report) => {
    if (!user) return;
    const row = {
      user_id: user.id,
      url: rep.url,
      score: rep.score,
      grade: rep.grade,
      summary: rep.summary,
      report: rep,
      crawl: rep.crawl ?? null,
    };
    const { error } = await supabase.from("audits").insert([row as never]);
    if (error) console.error("Failed to save audit:", error.message);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!website.trim()) {
      setApiError("Please enter a website URL.");
      return;
    }
    setIsLoading(true);
    setApiError("");
    setReport(null);

    try {
      const { data, error } = await supabase.functions.invoke("run-seo-agent", {
        body: { url: website.trim(), crawl: crawlSite ? { max: 10 } : undefined },
      });
      if (error) throw new Error(error.message || "Failed to analyze site");
      if (data?.error) throw new Error(data.error);
      const rep = data as Report;
      setReport(rep);
      void saveAudit(rep);
      if (user) toast({ title: "Audit saved", description: "Find it later in your history." });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setApiError("");
    setWebsite("");
    if (params.get("audit")) {
      params.delete("audit");
      setParams(params, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-[linear-gradient(hsl(var(--muted)/0.5)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.5)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <AppHeader />

        {!report && !isLoading && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Score your site's <span className="text-gradient">SEO health</span>
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Enter your website URL and get an instant audit with a real score, prioritized issues, and clear fixes.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="example.com"
                    className="pl-10 h-12 text-base bg-muted/50 border-border focus:ring-primary focus:border-primary/50"
                    autoFocus
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 gap-2 glow-primary font-semibold px-6">
                  <Search className="h-4 w-4" />
                  Analyze
                </Button>
              </div>

              <label className="mt-4 flex items-start gap-2.5 cursor-pointer rounded-lg border border-border bg-muted/30 px-3 py-2.5 hover:bg-muted/50 transition-colors">
                <Checkbox checked={crawlSite} onCheckedChange={(v) => setCrawlSite(!!v)} className="mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Also audit up to 10 internal pages
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Slower (~30-90s) but catches issues hiding on other pages.
                  </p>
                </div>
              </label>

              {!user && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  💡 <button type="button" className="text-primary hover:underline font-medium" onClick={() => nav("/auth")}>Sign in</button> to save audits to your history.
                </p>
              )}

              {apiError && <p className="text-sm text-destructive mt-3">{apiError}</p>}
            </form>

            <p className="text-xs text-muted-foreground/60 text-center mt-6">
              We'll fetch your page and check titles, meta tags, headings, performance signals, structured data and more.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="animate-fade-in-up">
            <LoadingSpinner />
            <p className="text-center text-xs text-muted-foreground mt-4">
              {crawlSite ? `Auditing ${website} and crawling internal pages…` : `Auditing ${website}…`}
            </p>
          </div>
        )}

        {apiError && !isLoading && report === null && website && (
          <div className="mt-4 animate-fade-in-up">
            <ErrorAlert message={apiError} />
          </div>
        )}

        {report && !isLoading && <SeoReport report={report} onReset={handleReset} />}
      </div>
    </div>
  );
};

export default Index;
