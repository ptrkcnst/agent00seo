import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonInput } from "@/components/JsonInput";
import { LimitSelect } from "@/components/LimitSelect";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";

interface SeoResults {
  keywords?: string;
  productPages?: string[];
  croSuggestions?: string;
  localSeo?: string;
}

const Index = () => {
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

  const handleRunAgent = async () => {
    const products = validateJson(jsonInput);
    if (!products) return;

    setIsLoading(true);
    setApiError("");
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("run-seo-agent", {
        body: {
          products,
          limit: parseInt(limit, 10),
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to run SEO agent");
      }

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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Agent 00Seo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            SEO Draft Generator – Internal Admin Tool
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Input Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <JsonInput
              value={jsonInput}
              onChange={setJsonInput}
              error={jsonError}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <LimitSelect value={limit} onChange={setLimit} />
              
              <Button
                onClick={handleRunAgent}
                disabled={isLoading}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Run Agent
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-6">
            <CardContent className="py-0">
              <LoadingSpinner />
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {apiError && !isLoading && (
          <div className="mb-6">
            <ErrorAlert message={apiError} />
          </div>
        )}

        {/* Results */}
        {results && !isLoading && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <ResultsDisplay results={results} />
            </CardContent>
          </Card>
        )}

        {/* Footer Disclaimer */}
        <div className="mt-8 rounded-md border border-border bg-muted/50 p-4">
          <p className="text-center text-xs text-muted-foreground">
            All generated content is draft-only and must be reviewed before publishing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
