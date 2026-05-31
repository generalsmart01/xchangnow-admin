"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { NetworkForm } from "@/components/networks/network-form";

export default function NewNetworkPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/networks">
          <ArrowLeft className="size-4" /> Back to networks
        </Link>
      </Button>
      <PageHeader
        title="Add network"
        description="Register a blockchain network."
      />
      <Card>
        <CardContent className="pt-6">
          <NetworkForm />
        </CardContent>
      </Card>
    </div>
  );
}
