"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Ban, ShieldAlert, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailList, DetailRow } from "@/components/shared/detail-list";
import { CopyButton } from "@/components/shared/copy-button";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { Pagination } from "@/components/shared/pagination";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { RoleBadge } from "@/components/staff/role-badge";
import { ChangeStatusDialog } from "@/components/users/change-status-dialog";
import { AnonymizeDialog } from "@/components/users/anonymize-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { PayoutsTable } from "@/components/payouts/payouts-table";
import { RoleGate } from "@/components/layout/role-gate";
import { getUser } from "@/lib/api/users";
import { listTransactions } from "@/lib/api/transactions";
import { listPayouts } from "@/lib/api/payouts";
import { ApiError } from "@/lib/api/client";
import { fullName } from "@/lib/format";

function UserTransactionsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["transactions", { userId, page, pageSize: 10 }],
    queryFn: () =>
      listTransactions({ userId, page, pageSize: 10 }).then((r) => r.data),
  });
  return (
    <div className="space-y-4">
      <TransactionsTable transactions={data?.transactions ?? []} loading={isLoading} />
      {data ? (
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={setPage}
          disabled={isFetching}
        />
      ) : null}
    </div>
  );
}

function UserPayoutsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["payouts", { userId, page, pageSize: 10 }],
    queryFn: () => listPayouts({ userId, page, pageSize: 10 }).then((r) => r.data),
  });
  return (
    <div className="space-y-4">
      <PayoutsTable payouts={data?.payouts ?? []} loading={isLoading} />
      {data ? (
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={setPage}
          disabled={isFetching}
        />
      ) : null}
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [statusOpen, setStatusOpen] = useState(false);
  const [anonOpen, setAnonOpen] = useState(false);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id).then((r) => r.data),
  });

  if (isLoading) return <LoadingBlock label="Loading user…" />;

  if (error || !user) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <EmptyState
        icon={XCircle}
        title={notFound ? "User not found" : "Couldn't load user"}
        description={error instanceof ApiError ? error.message : "Please try again."}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="size-4" /> Back to users
            </Link>
          </Button>
        }
      />
    );
  }

  const isAnonymized = user.status === "ANONYMIZED";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/admin/users">
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{fullName(user)}</h1>
          <RoleBadge role={user.role} />
          <UserStatusBadge status={user.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList>
                <DetailRow label="Email">
                  <span className="flex items-center gap-1">
                    {user.email}
                    <CopyButton value={user.email} label="Email" />
                  </span>
                </DetailRow>
                <DetailRow label="Phone">
                  <span className="font-mono">{user.phoneNumber ?? "—"}</span>
                </DetailRow>
                <DetailRow label="Role">
                  <RoleBadge role={user.role} />
                </DetailRow>
                <DetailRow label="Status">
                  <UserStatusBadge status={user.status} />
                </DetailRow>
                <DetailRow label="Email verified">
                  {user.isEmailVerified ? "Yes" : "No"}
                </DetailRow>
                <DetailRow label="Member since">
                  <DateTimeDisplay value={user.createdAt} absolute />
                </DetailRow>
                <DetailRow label="Last login">
                  <DateTimeDisplay value={user.lastLoginAt} />
                </DetailRow>
                <DetailRow label="User ID">
                  <span className="font-mono text-xs">{user.id}</span>
                </DetailRow>
              </DetailList>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <RoleGate
                cap="users.changeStatus"
                fallback={
                  <p className="text-sm text-muted-foreground">
                    You have read-only access.
                  </p>
                }
              >
                <Button
                  variant="outline"
                  onClick={() => setStatusOpen(true)}
                  disabled={isAnonymized}
                >
                  <Ban className="size-4" /> Change status
                </Button>
              </RoleGate>

              <RoleGate cap="users.anonymize">
                <Separator className="my-1" />
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setAnonOpen(true)}
                  disabled={isAnonymized}
                >
                  <ShieldAlert className="size-4" /> Anonymize
                </Button>
              </RoleGate>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="pt-4">
          <UserTransactionsTab userId={user.id} />
        </TabsContent>
        <TabsContent value="payouts" className="pt-4">
          <UserPayoutsTab userId={user.id} />
        </TabsContent>
      </Tabs>

      <ChangeStatusDialog user={user} open={statusOpen} onOpenChange={setStatusOpen} />
      <AnonymizeDialog user={user} open={anonOpen} onOpenChange={setAnonOpen} />
    </div>
  );
}
