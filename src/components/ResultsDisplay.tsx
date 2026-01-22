import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface ResultsDisplayProps {
  results: {
    keywords?: string;
    productPages?: string[];
    croSuggestions?: string;
    localSeo?: string;
  };
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const copyToClipboard = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
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
    { id: "keywords", label: "Keywords", content: results.keywords || "" },
    { id: "product-page-1", label: "Product Page 1", content: results.productPages?.[0] || "" },
    { id: "product-page-2", label: "Product Page 2", content: results.productPages?.[1] || "" },
    { id: "cro-suggestions", label: "CRO Suggestions", content: results.croSuggestions || "" },
    { id: "local-seo", label: "Local SEO", content: results.localSeo || "" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Generated Drafts</h2>
      <Tabs defaultValue="keywords" className="w-full">
        <TabsList className="w-full justify-start bg-muted p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-card data-[state=active]:text-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-end gap-2 border-b border-border px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(tab.content, tab.label)}
                  className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadContent(tab.content, tab.id, tab.id === "keywords")}
                  className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="max-h-[400px] overflow-auto p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                  {tab.content || "No content available"}
                </pre>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
