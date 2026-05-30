import { money, crypto } from "@/lib/format";
import { cn } from "@/lib/utils";

type CurrencyDisplayProps = {
  amount: string | number | null | undefined;
  currency?: string;
  className?: string;
};

/** Formats a decimal-string fiat amount, e.g. ₦290,000.00 */
export function CurrencyDisplay({
  amount,
  currency = "NGN",
  className,
}: CurrencyDisplayProps) {
  return (
    <span className={cn("tabular-nums", className)}>
      {money(amount, currency)}
    </span>
  );
}

type CryptoDisplayProps = {
  amount: string | number | null | undefined;
  asset?: string;
  className?: string;
};

export function CryptoDisplay({ amount, asset, className }: CryptoDisplayProps) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {crypto(amount, asset)}
    </span>
  );
}
