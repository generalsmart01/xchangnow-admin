import { cn } from "@/lib/utils";

/** Small round asset icon with a lettered fallback when no iconUrl is set. */
export function AssetIcon({
  symbol,
  iconUrl,
  className,
}: {
  symbol: string;
  iconUrl?: string | null;
  className?: string;
}) {
  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt={symbol}
        className={cn("size-6 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "grid size-6 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary",
        className,
      )}
    >
      {symbol.slice(0, 3)}
    </span>
  );
}
