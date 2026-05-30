import { CopyButton } from "@/components/shared/copy-button";
import { truncateMiddle } from "@/lib/format";
import { cn } from "@/lib/utils";

export function WalletAddressDisplay({
  address,
  className,
  truncate = true,
}: {
  address: string;
  className?: string;
  truncate?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <code className="font-mono text-xs">
        {truncate ? truncateMiddle(address, 10, 8) : address}
      </code>
      <CopyButton value={address} label="Address" />
    </span>
  );
}
