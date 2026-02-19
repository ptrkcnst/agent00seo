import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LimitSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function LimitSelect({ value, onChange }: LimitSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] bg-muted/50 border-border text-sm">
        <SelectValue placeholder="Select limit" />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        <SelectItem value="2">2 products</SelectItem>
        <SelectItem value="5">5 products</SelectItem>
        <SelectItem value="10">10 products</SelectItem>
      </SelectContent>
    </Select>
  );
}
