"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { WalletForm } from "@/components/wallets/wallet-form";
import { getWallet } from "@/lib/api/wallets";
import { ApiError } from "@/lib/api/client";

export default function WalletEditPage() {
  const { id } = useParams<{ id: string }>();

  const { data: wallet, isLoading, error } = useQuery({
    queryKey: ["wallet", id],
    queryFn: () => getWallet(id).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/wallets">
          <ArrowLeft className="size-4" /> Back to wallets
        </Link>
      </Button>

      {isLoading ? (
        <LoadingBlock label="Loading wallet…" />
      ) : error || !wallet ? (
        <EmptyState
          icon={XCircle}
          title={
            error instanceof ApiError && error.status === 404
              ? "Wallet not found"
              : "Couldn't load wallet"
          }
          description={error instanceof ApiError ? error.message : "Please try again."}
          action={
            <Button variant="outline" asChild>
              <Link href="/admin/wallets">
                <ArrowLeft className="size-4" /> Back to wallets
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <PageHeader
            title="Edit wallet"
            description="Only the label and active state can be changed."
          />
          <Card>
            <CardContent className="pt-6">
              <WalletForm wallet={wallet} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
