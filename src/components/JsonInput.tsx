import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const placeholderJson = `[
  {"name":"Product name","slug":"product-slug","type":"premium_set","price":599},
  {"name":"Second product","slug":"second-slug","type":"premium_set","price":549}
]`;

export function JsonInput({ value, onChange, error }: JsonInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="products-json" className="text-sm font-medium text-foreground">
        Products JSON
      </Label>
      <Textarea
        id="products-json"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholderJson}
        className="min-h-[200px] font-mono text-sm bg-card border-border focus:ring-primary resize-y"
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
