"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { NewRateForm } from "@/components/rates/new-rate-form";

export default function NewRatePage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/rates">
          <ArrowLeft className="size-4" /> Back to rates
        </Link>
      </Button>
      <PageHeader
        title="Add FX rate"
        description="Record a manual NGN-per-USD buy/sell rate."
      />
      <Card>
        <CardContent className="pt-6">
          <NewRateForm />
        </CardContent>
      </Card>
    </div>
  );
}
