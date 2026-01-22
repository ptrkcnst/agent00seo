import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LimitSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function LimitSelect({ value, onChange }: LimitSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="limit-select" className="text-sm font-medium text-foreground">
        Number of products to process
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="limit-select" className="w-[180px] bg-card">
          <SelectValue placeholder="Select limit" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="2">2 products</SelectItem>
          <SelectItem value="5">5 products</SelectItem>
          <SelectItem value="10">10 products</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
