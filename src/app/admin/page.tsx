"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  Banknote,
  IdCard,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionTypeBadge } from "@/components/transactions/transaction-type-badge";
import { PayoutStatusBadge } from "@/components/payouts/payout-status-badge";
import { KycStatusBadge } from "@/components/kyc/kyc-status-badge";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { CurrentFxCard } from "@/components/rates/current-rates-card";
import { listTransactions } from "@/lib/api/transactions";
import { listPayouts } from "@/lib/api/payouts";
import { listKyc } from "@/lib/api/kyc";
import { listRates } from "@/lib/api/rates";
import { useAuth } from "@/lib/hooks/use-auth";
import { fullName } from "@/lib/format";

function QueueCard({
  title,
  href,
  children,
  loading,
  empty,
  isEmpty,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
  loading: boolean;
  empty: string;
  isEmpty: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={href}>
            View all <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingBlock />
        ) : isEmpty ? (
          <EmptyState title={empty} className="border-0 py-8" />
        ) : (
          <ul className="divide-y">{children}</ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const underReview = useQuery({
    queryKey: ["dashboard", "transactions", "UNDER_REVIEW"],
    queryFn: () =>
      listTransactions({ status: "UNDER_REVIEW", pageSize: 5 }).then((r) => r.data),
  });
  const pendingPayouts = useQuery({
    queryKey: ["dashboard", "payouts", "PENDING"],
    queryFn: () => listPayouts({ status: "PENDING", pageSize: 5 }).then((r) => r.data),
  });
  const pendingKyc = useQuery({
    queryKey: ["dashboard", "kyc", "PENDING"],
    queryFn: () => listKyc({ status: "PENDING", pageSize: 5 }).then((r) => r.data),
  });
  const approved = useQuery({
    queryKey: ["dashboard", "transactions", "APPROVED", "count"],
    queryFn: () =>
      listTransactions({ status: "APPROVED", pageSize: 1 }).then((r) => r.data),
  });
  const fx = useQuery({
    queryKey: ["rates", { pageSize: 1 }],
    queryFn: () => listRates({ pageSize: 1 }).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.firstName}`}
        description="Here's what needs attention across the exchange."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Under review"
          value={underReview.data?.total ?? 0}
          icon={ArrowLeftRight}
          tone="info"
          href="/admin/transactions?status=UNDER_REVIEW"
          loading={underReview.isLoading}
          hint="Transactions awaiting a decision"
        />
        <StatCard
          label="Pending payouts"
          value={pendingPayouts.data?.total ?? 0}
          icon={Banknote}
          tone="warning"
          href="/admin/payouts?status=PENDING"
          loading={pendingPayouts.isLoading}
          hint="Awaiting processing"
        />
        <StatCard
          label="Pending KYC"
          value={pendingKyc.data?.total ?? 0}
          icon={IdCard}
          tone="brand"
          href="/admin/kyc?status=PENDING"
          loading={pendingKyc.isLoading}
          hint="Submissions to review"
        />
        <StatCard
          label="Approved txns"
          value={approved.data?.total ?? 0}
          icon={CheckCircle2}
          tone="success"
          href="/admin/transactions?status=APPROVED"
          loading={approved.isLoading}
          hint="Approved, not yet completed"
        />
      </div>

      <CurrentFxCard
        rate={fx.data?.rates[0]}
        loading={fx.isLoading}
        href="/admin/rates"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <QueueCard
          title="Review queue"
          href="/admin/transactions?status=UNDER_REVIEW"
          loading={underReview.isLoading}
          isEmpty={(underReview.data?.transactions.length ?? 0) === 0}
          empty="No transactions under review"
        >
          {underReview.data?.transactions.map((tx) => (
            <li key={tx.id} className="py-2.5">
              <Link
                href={`/admin/transactions/${tx.id}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  <TransactionTypeBadge type={tx.type} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {tx.referenceCode}
                  </span>
                </span>
                <CurrencyDisplay
                  amount={tx.fiatAmount}
                  currency={tx.fiatCurrency}
                  className="font-medium"
                />
              </Link>
            </li>
          ))}
        </QueueCard>

        <QueueCard
          title="Oldest pending payouts"
          href="/admin/payouts?status=PENDING"
          loading={pendingPayouts.isLoading}
          isEmpty={(pendingPayouts.data?.payouts.length ?? 0) === 0}
          empty="No payouts pending"
        >
          {pendingPayouts.data?.payouts.map((p) => (
            <li key={p.id} className="py-2.5">
              <Link
                href={`/admin/payouts/${p.id}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  <PayoutStatusBadge status={p.status} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {p.reference}
                  </span>
                </span>
                <CurrencyDisplay
                  amount={p.amount}
                  currency={p.currency}
                  className="font-medium"
                />
              </Link>
            </li>
          ))}
        </QueueCard>

        <QueueCard
          title="Oldest pending KYC"
          href="/admin/kyc?status=PENDING"
          loading={pendingKyc.isLoading}
          isEmpty={(pendingKyc.data?.submissions.length ?? 0) === 0}
          empty="No KYC submissions pending"
        >
          {pendingKyc.data?.submissions.map((k) => (
            <li key={k.userId} className="py-2.5">
              <Link
                href={`/admin/kyc/${k.userId}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{fullName(k.user)}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {k.user.email}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <KycStatusBadge status={k.kycStatus} />
                  <DateTimeDisplay
                    value={k.submittedAt}
                    className="text-xs text-muted-foreground"
                  />
                </span>
              </Link>
            </li>
          ))}
        </QueueCard>
      </div>
    </div>
  );
}
