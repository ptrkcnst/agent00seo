import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onLoadSample?: () => void;
}

const placeholderJson = `[
  {"name":"Product name","slug":"product-slug","type":"premium_set","price":599},
  {"name":"Second product","slug":"second-slug","type":"premium_set","price":549}
]`;

export function JsonInput({ value, onChange, error, onLoadSample }: JsonInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="products-json" className="text-sm font-medium text-muted-foreground">
          Products JSON
        </Label>
        {onLoadSample && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLoadSample}
            className="h-7 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10"
          >
            <Wand2 className="h-3 w-3" />
            Load sample
          </Button>
        )}
      </div>
      <Textarea
        id="products-json"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholderJson}
        className="min-h-[180px] font-mono text-sm bg-muted/50 border-border focus:ring-primary focus:border-primary/50 resize-y transition-colors"
      />
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
          {error}
        </p>
      )}
    </div>
  );
}
