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
import { NetworkForm } from "@/components/networks/network-form";
import { getNetwork } from "@/lib/api/networks";
import { ApiError } from "@/lib/api/client";

export default function NetworkEditPage() {
  const { id } = useParams<{ id: string }>();

  const { data: network, isLoading, error } = useQuery({
    queryKey: ["network", id],
    queryFn: () => getNetwork(id).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/networks">
          <ArrowLeft className="size-4" /> Back to networks
        </Link>
      </Button>

      {isLoading ? (
        <LoadingBlock label="Loading network…" />
      ) : error || !network ? (
        <EmptyState
          icon={XCircle}
          title={
            error instanceof ApiError && error.status === 404
              ? "Network not found"
              : "Couldn't load network"
          }
          description={error instanceof ApiError ? error.message : "Please try again."}
          action={
            <Button variant="outline" asChild>
              <Link href="/admin/networks">
                <ArrowLeft className="size-4" /> Back to networks
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <PageHeader
            title={`Edit ${network.name}`}
            description="The network code is immutable."
          />
          <Card>
            <CardContent className="pt-6">
              <NetworkForm network={network} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
