"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { WalletForm } from "@/components/wallets/wallet-form";

export default function NewWalletPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/wallets">
          <ArrowLeft className="size-4" /> Back to wallets
        </Link>
      </Button>
      <PageHeader title="Add wallet" description="Register a new hot wallet address." />
      <Card>
        <CardContent className="pt-6">
          <WalletForm />
        </CardContent>
      </Card>
    </div>
  );
}
