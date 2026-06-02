"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailList, DetailRow } from "@/components/shared/detail-list";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { RoleBadge } from "@/components/staff/role-badge";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { ChangeRoleDialog } from "@/components/staff/change-role-dialog";
import { RoleGate } from "@/components/layout/role-gate";
import { getStaff } from "@/lib/api/staff";
import { useAuth } from "@/lib/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { fullName } from "@/lib/format";

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const [roleOpen, setRoleOpen] = useState(false);

  const { data: staff, isLoading, error } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaff(id).then((r) => r.data),
  });

  if (isLoading) return <LoadingBlock label="Loading staff member…" />;

  if (error || !staff) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <EmptyState
        icon={XCircle}
        title={notFound ? "Staff member not found" : "Couldn't load staff member"}
        description={error instanceof ApiError ? error.message : "Please try again."}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/staff">
              <ArrowLeft className="size-4" /> Back to staff
            </Link>
          </Button>
        }
      />
    );
  }

  const isSelf = staff.id === me.id;
  const isSuperAdmin = staff.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/admin/staff">
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{fullName(staff)}</h1>
          <RoleBadge role={staff.role} />
          <UserStatusBadge status={staff.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList>
                <DetailRow label="Email">{staff.email}</DetailRow>
                <DetailRow label="Role">
                  <RoleBadge role={staff.role} />
                </DetailRow>
                <DetailRow label="Status">
                  <UserStatusBadge status={staff.status} />
                </DetailRow>
                <DetailRow label="Email verified">
                  {staff.isEmailVerified ? "Yes" : "No"}
                </DetailRow>
                <DetailRow label="Last login">
                  <DateTimeDisplay value={staff.lastLoginAt} />
                </DetailRow>
                <DetailRow label="Created">
                  <DateTimeDisplay value={staff.createdAt} />
                </DetailRow>
              </DetailList>
            </CardContent>
          </Card>
        </div>

        <div>
          <RoleGate
            cap="staff.changeRole"
            fallback={
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Only a Super Admin can change roles.
                </CardContent>
              </Card>
            }
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => setRoleOpen(true)}
                  disabled={isSelf || isSuperAdmin}
                >
                  <ShieldCheck className="size-4" /> Change role
                </Button>
                {isSelf ? (
                  <p className="text-xs text-muted-foreground">
                    You can&apos;t change your own role.
                  </p>
                ) : isSuperAdmin ? (
                  <p className="text-xs text-muted-foreground">
                    Super Admin roles can&apos;t be changed here.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </RoleGate>
        </div>
      </div>

      <ChangeRoleDialog staff={staff} open={roleOpen} onOpenChange={setRoleOpen} />
    </div>
  );
}
