"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailList, DetailRow } from "@/components/shared/detail-list";
import { CopyButton } from "@/components/shared/copy-button";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { PayoutStatusBadge } from "@/components/payouts/payout-status-badge";
import { TransactionStatusBadge } from "@/components/transactions/transaction-status-badge";
import { TransactionTypeBadge } from "@/components/transactions/transaction-type-badge";
import {
  PAYOUT_TRANSITIONS,
  UpdateStatusDialog,
} from "@/components/payouts/update-status-dialog";
import { RoleGate } from "@/components/layout/role-gate";
import { getPayout } from "@/lib/api/payouts";
import { ApiError } from "@/lib/api/client";
import type { PayoutStatus } from "@/lib/types/payout";
import { titleCase } from "@/lib/labels";

export default function PayoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [target, setTarget] = useState<PayoutStatus | null>(null);

  const { data: payout, isLoading, error } = useQuery({
    queryKey: ["payout", id],
    queryFn: () => getPayout(id).then((r) => r.data),
  });

  if (isLoading) return <LoadingBlock label="Loading payout…" />;

  if (error || !payout) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <EmptyState
        icon={XCircle}
        title={notFound ? "Payout not found" : "Couldn't load payout"}
        description={error instanceof ApiError ? error.message : "Please try again."}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/payouts">
              <ArrowLeft className="size-4" /> Back to payouts
            </Link>
          </Button>
        }
      />
    );
  }

  const transitions = PAYOUT_TRANSITIONS[payout.status];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/admin/payouts">
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-xl font-semibold tracking-tight">
            {payout.reference}
          </h1>
          <PayoutStatusBadge status={payout.status} />
          <CopyButton value={payout.reference} label="Reference" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList>
                <DetailRow label="Amount">
                  <CurrencyDisplay amount={payout.amount} currency={payout.currency} />
                </DetailRow>
                <DetailRow label="Status">
                  <PayoutStatusBadge status={payout.status} />
                </DetailRow>
                <DetailRow label="Created">
                  <DateTimeDisplay value={payout.createdAt} />
                </DetailRow>
                {payout.processedAt ? (
                  <DetailRow label="Processed">
                    <DateTimeDisplay value={payout.processedAt} />
                  </DetailRow>
                ) : null}
                {payout.paidAt ? (
                  <DetailRow label="Paid">
                    <DateTimeDisplay value={payout.paidAt} />
                  </DetailRow>
                ) : null}
                {payout.failureReason ? (
                  <DetailRow label="Failure reason">
                    <span className="text-destructive">{payout.failureReason}</span>
                  </DetailRow>
                ) : null}
              </DetailList>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Beneficiary bank account</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList>
                <DetailRow label="Account name">
                  {payout.bankAccount?.accountName ?? "—"}
                </DetailRow>
                <DetailRow label="Bank">
                  {payout.bankAccount?.bankName ?? "—"}
                </DetailRow>
                <DetailRow label="Account number">
                  <span className="flex items-center gap-1">
                    <span className="font-mono">
                      {payout.bankAccount?.accountNumber ?? "—"}
                    </span>
                    {payout.bankAccount?.accountNumber ? (
                      <CopyButton
                        value={payout.bankAccount.accountNumber}
                        label="Account number"
                      />
                    ) : null}
                  </span>
                </DetailRow>
              </DetailList>
              <p className="mt-3 text-xs text-muted-foreground">
                Sensitive payout details — use only to complete the bank transfer.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {transitions.length > 0 ? (
            <RoleGate cap="payouts.updateStatus">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Update status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    Current: <PayoutStatusBadge status={payout.status} />
                  </p>
                  {transitions.map((next) => (
                    <Button
                      key={next}
                      variant={next === "FAILED" ? "outline" : "default"}
                      className={
                        next === "FAILED"
                          ? "text-destructive hover:text-destructive"
                          : undefined
                      }
                      onClick={() => setTarget(next)}
                    >
                      <ArrowRight className="size-4" /> Mark {titleCase(next)}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </RoleGate>
          ) : null}

          {payout.transaction ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Source transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailList>
                  <DetailRow label="Reference">
                    <span className="font-mono text-xs">
                      {payout.transaction.referenceCode}
                    </span>
                  </DetailRow>
                  <DetailRow label="Type">
                    <TransactionTypeBadge type={payout.transaction.type} />
                  </DetailRow>
                  <DetailRow label="Status">
                    <TransactionStatusBadge status={payout.transaction.status} />
                  </DetailRow>
                  <DetailRow label="Amount">
                    <CurrencyDisplay amount={payout.transaction.fiatAmount} />
                  </DetailRow>
                </DetailList>
                <Separator className="my-3" />
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/admin/transactions/${payout.transactionId}`}>
                    View transaction
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {target ? (
        <UpdateStatusDialog
          payout={payout}
          target={target}
          open
          onOpenChange={(o) => !o && setTarget(null)}
        />
      ) : null}
    </div>
  );
}
