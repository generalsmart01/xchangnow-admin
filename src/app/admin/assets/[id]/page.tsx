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
import { AssetIcon } from "@/components/shared/asset-icon";
import { AssetForm } from "@/components/assets/asset-form";
import { AssetPriceCard } from "@/components/assets/asset-price-card";
import { AssetNetworksPanel } from "@/components/assets/asset-networks-panel";
import { getAsset } from "@/lib/api/assets";
import { ApiError } from "@/lib/api/client";

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: asset, isLoading, error } = useQuery({
    queryKey: ["asset", id],
    queryFn: () => getAsset(id).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/assets">
          <ArrowLeft className="size-4" /> Back to assets
        </Link>
      </Button>

      {isLoading ? (
        <LoadingBlock label="Loading asset…" />
      ) : error || !asset ? (
        <EmptyState
          icon={XCircle}
          title={
            error instanceof ApiError && error.status === 404
              ? "Asset not found"
              : "Couldn't load asset"
          }
          description={error instanceof ApiError ? error.message : "Please try again."}
          action={
            <Button variant="outline" asChild>
              <Link href="/admin/assets">
                <ArrowLeft className="size-4" /> Back to assets
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <PageHeader
            title={
              <span className="flex items-center gap-2.5">
                <AssetIcon symbol={asset.symbol} iconUrl={asset.iconUrl} className="size-7" />
                {asset.symbol}
                <span className="text-base font-normal text-muted-foreground">
                  {asset.name}
                </span>
              </span>
            }
            description="Edit asset details and manage its network pairs."
          />

          <Card>
            <CardContent className="pt-6">
              <AssetForm asset={asset} />
            </CardContent>
          </Card>

          <AssetPriceCard asset={asset} />

          <AssetNetworksPanel asset={asset} />
        </>
      )}
    </div>
  );
}
