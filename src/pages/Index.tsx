import { useState } from "react";
import { Button } from "@/components/ui/button";
import { JsonInput } from "@/components/JsonInput";
import { LimitSelect } from "@/components/LimitSelect";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { supabase } from "@/integrations/supabase/client";
import { Play, Zap, FileJson, Settings2, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SeoResults {
  keywords?: string;
  productPages?: string[];
  croSuggestions?: string;
  localSeo?: string;
}

const sampleProducts = [
  { name: "Premium Chess Set", slug: "premium-chess-set", type: "premium_set", price: 599 },
  { name: "Tournament Board", slug: "tournament-board", type: "premium_set", price: 349 },
];

const Index = () => {
  const [website, setWebsite] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [limit, setLimit] = useState("2");
  const [jsonError, setJsonError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [results, setResults] = useState<SeoResults | null>(null);

  const validateJson = (input: string): unknown[] | null => {
    if (!input.trim()) {
      setJsonError("Please enter products JSON");
      return null;
    }
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) {
        setJsonError("JSON must be an array of products");
        return null;
      }
      setJsonError("");
      return parsed;
    } catch {
      setJsonError("Invalid JSON format");
      return null;
    }
  };

  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(sampleProducts, null, 2));
    setJsonError("");
  };

  const handleRunAgent = async () => {
    const products = validateJson(jsonInput);
    if (!products) return;

    setIsLoading(true);
    setApiError("");
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("run-seo-agent", {
        body: { products, limit: parseInt(limit, 10) },
      });

      if (error) throw new Error(error.message || "Failed to run SEO agent");
      setResults(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(hsl(220_18%_14%_/_0.5)_1px,transparent_1px),linear-gradient(90deg,hsl(220_18%_14%_/_0.5)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-primary-sm">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gradient">
              Agent 00Seo
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[52px]">
            AI-powered SEO draft generator for product pages
          </p>
        </header>

        {/* Website Field */}
        <div className="mb-6 animate-fade-in-up rounded-xl border border-border bg-card p-6 shadow-lg" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">Website</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website-url" className="text-sm font-medium text-muted-foreground">
              Website URL
            </Label>
            <Input
              id="website-url"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="bg-muted/50 border-border focus:ring-primary focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Input Card */}
        <div className="mb-6 animate-fade-in-up rounded-xl border border-border bg-card p-6 shadow-lg" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-5">
            <FileJson className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">Input</h2>
          </div>

          <JsonInput
            value={jsonInput}
            onChange={setJsonInput}
            error={jsonError}
            onLoadSample={handleLoadSample}
          />

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <LimitSelect value={limit} onChange={setLimit} />
            </div>

            <Button
              onClick={handleRunAgent}
              disabled={isLoading}
              className="gap-2 glow-primary hover:glow-primary transition-shadow font-semibold px-6"
              size="lg"
            >
              <Play className="h-4 w-4" />
              Run Agent
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mb-6 animate-fade-in-up">
            <LoadingSpinner />
          </div>
        )}

        {/* Error */}
        {apiError && !isLoading && (
          <div className="mb-6 animate-fade-in-up">
            <ErrorAlert message={apiError} />
          </div>
        )}

        {/* Results */}
        {results && !isLoading && (
          <div className="mb-6 animate-fade-in-up">
            <ResultsDisplay results={results} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs text-muted-foreground/60">
            All generated content is draft-only and must be reviewed before publishing.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
