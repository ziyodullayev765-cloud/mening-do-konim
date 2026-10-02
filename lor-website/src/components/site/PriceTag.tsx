import { formatPrice } from "@/lib/format";

export function PriceTag({ price, from, className = "" }: { price: number | null; from: boolean; className?: string }) {
  return (
    <span className={`font-semibold tabular-nums text-ink ${price == null ? "text-sm font-medium text-muted" : ""} ${className}`}>
      {formatPrice(price, from)}
    </span>
  );
}
