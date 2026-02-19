import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, Search, FileText, MousePointerClick, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ResultsDisplayProps {
  results: {
    keywords?: string;
    productPages?: string[];
    croSuggestions?: string;
    localSeo?: string;
  };
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (content: string, id: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast.success(`${label} copied`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadContent = (content: string, filename: string, isJson: boolean = false) => {
    const extension = isJson ? "json" : "md";
    const mimeType = isJson ? "application/json" : "text/markdown";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}.${extension}`);
  };

  const tabs = [
    { id: "keywords", label: "Keywords", icon: Search, content: results.keywords || "" },
    { id: "product-page-1", label: "Page 1", icon: FileText, content: results.productPages?.[0] || "" },
    { id: "product-page-2", label: "Page 2", icon: FileText, content: results.productPages?.[1] || "" },
    { id: "cro-suggestions", label: "CRO", icon: MousePointerClick, content: results.croSuggestions || "" },
    { id: "local-seo", label: "Local SEO", icon: MapPin, content: results.localSeo || "" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">Results</h2>
      </div>

      <Tabs defaultValue="keywords" className="w-full">
        <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-lg overflow-x-auto gap-0.5">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md transition-colors"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-3 animate-fade-in-up">
            <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
              <div className="flex items-center justify-end gap-1 border-b border-border px-3 py-1.5 bg-muted/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(tab.content, tab.id, tab.label)}
                  className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                >
                  {copiedId === tab.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedId === tab.id ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadContent(tab.content, tab.id, tab.id === "keywords")}
                  className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
              <div className="max-h-[400px] overflow-auto p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-foreground/85 leading-relaxed">
                  {tab.content || (
                    <span className="text-muted-foreground italic">No content available for this section.</span>
                  )}
                </pre>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
