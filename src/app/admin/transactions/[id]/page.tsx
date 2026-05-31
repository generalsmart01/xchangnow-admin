"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ThumbsUp, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailList, DetailRow } from "@/components/shared/detail-list";
import { CopyButton } from "@/components/shared/copy-button";
import { CurrencyDisplay, CryptoDisplay } from "@/components/shared/currency-display";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { TransactionStatusBadge } from "@/components/transactions/transaction-status-badge";
import { TransactionTypeBadge } from "@/components/transactions/transaction-type-badge";
import { ProofViewer } from "@/components/transactions/proof-viewer";
import { ApproveDialog } from "@/components/transactions/approve-dialog";
import { RejectDialog } from "@/components/transactions/reject-dialog";
import { MarkCompletedDialog } from "@/components/transactions/mark-completed-dialog";
import { RoleGate } from "@/components/layout/role-gate";
import { getTransaction } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { fullName, money, truncateMiddle } from "@/lib/format";
import { assetSymbol, pairLabel } from "@/lib/asset-display";

type DialogKind = "approve" | "reject" | "complete" | null;

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dialog, setDialog] = useState<DialogKind>(null);

  const { data: tx, isLoading, error } = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => getTransaction(id).then((r) => r.data),
  });

  if (isLoading) return <LoadingBlock label="Loading transaction…" />;

  if (error || !tx) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <EmptyState
        icon={XCircle}
        title={notFound ? "Transaction not found" : "Couldn't load transaction"}
        description={
          error instanceof ApiError ? error.message : "Please try again."
        }
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/transactions">
              <ArrowLeft className="size-4" /> Back to transactions
            </Link>
          </Button>
        }
      />
    );
  }

  const canApprove = tx.status === "UNDER_REVIEW";
  const canReject = ["PENDING", "AWAITING_PAYMENT", "UNDER_REVIEW"].includes(
    tx.status,
  );
  const canComplete =
    (tx.type === "BUY" || tx.type === "SWAP") && tx.status === "APPROVED";
  const hasActions = canApprove || canReject || canComplete;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/admin/transactions">
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-xl font-semibold tracking-tight">
            {tx.referenceCode}
          </h1>
          <TransactionTypeBadge type={tx.type} />
          <TransactionStatusBadge status={tx.status} />
          <CopyButton value={tx.referenceCode} label="Reference" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transaction details</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList>
                <DetailRow label="Type">
                  <TransactionTypeBadge type={tx.type} />
                </DetailRow>
                <DetailRow label="Status">
                  <TransactionStatusBadge status={tx.status} />
                </DetailRow>
                <DetailRow label="Asset">{pairLabel(tx.assetNetwork)}</DetailRow>
                <DetailRow label="Crypto amount">
                  <CryptoDisplay
                    amount={tx.cryptoAmount}
                    asset={assetSymbol(tx.assetNetwork)}
                  />
                </DetailRow>
                {tx.usdAmount ? (
                  <DetailRow label="USD value">
                    <CurrencyDisplay amount={tx.usdAmount} currency="USD" />
                  </DetailRow>
                ) : null}
                {tx.type === "SWAP" && tx.toAssetNetwork ? (
                  <>
                    <DetailRow label="Swap to">
                      <CryptoDisplay
                        amount={tx.toAmount ?? ""}
                        asset={assetSymbol(tx.toAssetNetwork)}
                      />
                    </DetailRow>
                    {tx.toUsdAmount ? (
                      <DetailRow label="Swap to (USD)">
                        <CurrencyDisplay amount={tx.toUsdAmount} currency="USD" />
                      </DetailRow>
                    ) : null}
                  </>
                ) : null}
                {tx.type !== "SWAP" ? (
                  <DetailRow label="Fiat amount">
                    <CurrencyDisplay
                      amount={tx.fiatAmount}
                      currency={tx.fiatCurrency}
                    />
                  </DetailRow>
                ) : null}
                {tx.assetPriceUsd ? (
                  <DetailRow label="Asset price (snapshot)">
                    <span className="tabular-nums">
                      {money(tx.assetPriceUsd, "USD")}
                    </span>
                  </DetailRow>
                ) : null}
                {tx.toAssetPriceUsd ? (
                  <DetailRow label="To asset price (snapshot)">
                    <span className="tabular-nums">
                      {money(tx.toAssetPriceUsd, "USD")}
                    </span>
                  </DetailRow>
                ) : null}
                {tx.fxRate ? (
                  <DetailRow label="FX rate (snapshot)">
                    <span className="tabular-nums">
                      {money(tx.fxRate, tx.fiatCurrency)} / USD
                    </span>
                  </DetailRow>
                ) : null}
                {tx.riskScore != null ? (
                  <DetailRow label="Risk score">{tx.riskScore}</DetailRow>
                ) : null}
                <DetailRow label="Created">
                  <DateTimeDisplay value={tx.createdAt} />
                </DetailRow>
                {tx.expiresAt ? (
                  <DetailRow label="Expires">
                    <DateTimeDisplay value={tx.expiresAt} />
                  </DetailRow>
                ) : null}
                {tx.approvedAt ? (
                  <DetailRow label="Approved">
                    <DateTimeDisplay value={tx.approvedAt} />
                  </DetailRow>
                ) : null}
                {tx.completedAt ? (
                  <DetailRow label="Completed">
                    <DateTimeDisplay value={tx.completedAt} />
                  </DetailRow>
                ) : null}
                {tx.rejectedReason ? (
                  <DetailRow label="Rejected reason">
                    <span className="text-destructive">{tx.rejectedReason}</span>
                  </DetailRow>
                ) : null}
              </DetailList>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proof of payment</CardTitle>
            </CardHeader>
            <CardContent>
              <ProofViewer
                proofs={tx.proofs}
                explorer={{ code: tx.assetNetwork?.network?.code }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {hasActions ? (
            <RoleGate cap="transactions.review">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {canApprove ? (
                    <Button onClick={() => setDialog("approve")}>
                      <ThumbsUp className="size-4" /> Approve
                    </Button>
                  ) : null}
                  {canComplete ? (
                    <Button onClick={() => setDialog("complete")}>
                      <CheckCircle2 className="size-4" /> Mark completed
                    </Button>
                  ) : null}
                  {canReject ? (
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDialog("reject")}
                    >
                      <XCircle className="size-4" /> Reject
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            </RoleGate>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList>
                <DetailRow label="Name">{fullName(tx.user)}</DetailRow>
                <DetailRow label="Email">{tx.user?.email ?? "—"}</DetailRow>
                <DetailRow label="User ID">
                  <span className="font-mono text-xs">
                    {truncateMiddle(tx.userId)}
                  </span>
                </DetailRow>
              </DetailList>
              <Separator className="my-3" />
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/admin/users/${tx.userId}`}>View customer profile</Link>
              </Button>
            </CardContent>
          </Card>

          {tx.walletAddress ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Wallet address</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailList>
                  <DetailRow label="Label">
                    {tx.walletAddress.label ?? "—"}
                  </DetailRow>
                  <DetailRow label="Address">
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-xs">
                        {truncateMiddle(tx.walletAddress.address, 8, 6)}
                      </span>
                      <CopyButton value={tx.walletAddress.address} label="Address" />
                    </span>
                  </DetailRow>
                </DetailList>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {dialog === "approve" ? (
        <ApproveDialog
          transaction={tx}
          open
          onOpenChange={(o) => !o && setDialog(null)}
        />
      ) : null}
      {dialog === "reject" ? (
        <RejectDialog
          transaction={tx}
          open
          onOpenChange={(o) => !o && setDialog(null)}
        />
      ) : null}
      {dialog === "complete" ? (
        <MarkCompletedDialog
          transaction={tx}
          open
          onOpenChange={(o) => !o && setDialog(null)}
        />
      ) : null}
    </div>
  );
}
