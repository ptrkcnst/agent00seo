import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { SeoReport, type Report } from "@/components/SeoReport";
import { supabase } from "@/integrations/supabase/client";
import { Search, Zap, Globe } from "lucide-react";

const Index = () => {
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [report, setReport] = useState<Report | null>(null);

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
        body: { url: website.trim() },
      });
      if (error) throw new Error(error.message || "Failed to analyze site");
      if (data?.error) throw new Error(data.error);
      setReport(data as Report);
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
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-[linear-gradient(hsl(220_18%_14%_/_0.5)_1px,transparent_1px),linear-gradient(90deg,hsl(220_18%_14%_/_0.5)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 flex items-center gap-3 animate-fade-in-up">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-primary-sm">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">Agent 00Seo</h1>
        </header>

        {/* Initial state: only URL input */}
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
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 gap-2 glow-primary font-semibold px-6"
                >
                  <Search className="h-4 w-4" />
                  Analyze
                </Button>
              </div>
              {apiError && (
                <p className="text-sm text-destructive mt-3">{apiError}</p>
              )}
            </form>

            <p className="text-xs text-muted-foreground/60 text-center mt-6">
              We'll fetch your page and check titles, meta tags, headings, performance signals, structured data and more.
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="animate-fade-in-up">
            <LoadingSpinner />
            <p className="text-center text-xs text-muted-foreground mt-4">Auditing {website}…</p>
          </div>
        )}

        {/* Error (post-analyze) */}
        {apiError && !isLoading && report === null && website && (
          <div className="mt-4 animate-fade-in-up">
            <ErrorAlert message={apiError} />
          </div>
        )}

        {/* Report */}
        {report && !isLoading && (
          <SeoReport report={report} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default Index;
