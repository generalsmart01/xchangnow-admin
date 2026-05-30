import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { ToneBadge } from "@/components/shared/tone-badge";
import { money } from "@/lib/format";
import type { CurrentRate } from "@/lib/types/rate";

export function CurrentRatesCard({
  rates,
  fiatCurrency = "NGN",
  loading,
}: {
  rates: CurrentRate[];
  fiatCurrency?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 py-5">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {rates.map((rate) => (
        <Card key={rate.asset}>
          <CardContent className="space-y-3 py-5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{rate.asset}</span>
              <ToneBadge tone="muted">{rate.source}</ToneBadge>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Buy</span>
                <span className="font-medium tabular-nums text-success">
                  {money(rate.buyRate, fiatCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sell</span>
                <span className="font-medium tabular-nums text-info">
                  {money(rate.sellRate, fiatCurrency)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Updated <DateTimeDisplay value={rate.fetchedAt} />
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
