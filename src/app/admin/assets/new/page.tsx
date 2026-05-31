"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { AssetForm } from "@/components/assets/asset-form";

export default function NewAssetPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/assets">
          <ArrowLeft className="size-4" /> Back to assets
        </Link>
      </Button>
      <PageHeader
        title="Add asset"
        description="Create a crypto asset, then attach its networks."
      />
      <Card>
        <CardContent className="pt-6">
          <AssetForm />
        </CardContent>
      </Card>
    </div>
  );
}
