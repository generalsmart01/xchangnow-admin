import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { ToneBadge } from "@/components/shared/tone-badge";
import { money } from "@/lib/format";
import type { FxRate } from "@/lib/types/rate";

function spread(rate: FxRate): string {
  try {
    return money(
      (Number(rate.buyRate) - Number(rate.sellRate)).toString(),
      rate.fiatCurrency,
    );
  } catch {
    return "—";
  }
}

/**
 * The current FX rate (NGN per USD) — derived FE-side as the newest snapshot.
 * `href` makes the whole card a link (used on the dashboard).
 */
export function CurrentFxCard({
  rate,
  loading,
  href,
}: {
  rate?: FxRate | null;
  loading?: boolean;
  href?: string;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-5">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const body = (
    <Card className={href ? "transition-shadow hover:shadow-md" : undefined}>
      <CardContent className="py-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm text-muted-foreground">
              Current FX rate — {rate?.fiatCurrency ?? "NGN"} per USD
            </p>
            {rate ? (
              <p className="text-xs text-muted-foreground">
                Updated <DateTimeDisplay value={rate.fetchedAt} />
              </p>
            ) : null}
          </div>
          {rate ? <ToneBadge tone="muted">{rate.source}</ToneBadge> : null}
        </div>

        {rate ? (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Buy</p>
              <p className="text-lg font-semibold tabular-nums text-success">
                {money(rate.buyRate, rate.fiatCurrency)}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Sell</p>
              <p className="text-lg font-semibold tabular-nums text-info">
                {money(rate.sellRate, rate.fiatCurrency)}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Spread</p>
              <p className="text-lg font-semibold tabular-nums">{spread(rate)}</p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No FX rate set yet.
          </p>
        )}
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
