"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { InviteStaffForm } from "@/components/staff/invite-staff-form";

export default function InviteStaffPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/staff">
          <ArrowLeft className="size-4" /> Back to staff
        </Link>
      </Button>
      <PageHeader
        title="Invite staff"
        description="Create a console account. They'll receive an email invite to set a password."
      />
      <Card>
        <CardContent className="pt-6">
          <InviteStaffForm />
        </CardContent>
      </Card>
    </div>
  );
}
