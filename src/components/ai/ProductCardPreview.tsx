import { Image as ImageIcon, Star } from "lucide-react";

export function ProductCardPreview({ name, description }: { name: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden max-w-sm">
      <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center">
        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-warning text-warning" />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">(128)</span>
        </div>
        <h4 className="text-sm font-semibold text-foreground leading-snug">{name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-base font-bold text-foreground">$49.99</span>
          <button className="text-[11px] font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
