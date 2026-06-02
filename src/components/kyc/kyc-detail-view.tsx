"use client";

import { useState } from "react";
import { Eye, EyeOff, ShieldAlert, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { DetailList, DetailRow } from "@/components/shared/detail-list";
import { CopyButton } from "@/components/shared/copy-button";
import { DateTimeDisplay } from "@/components/shared/datetime-display";
import { KycStatusBadge } from "./kyc-status-badge";
import { KycApproveButton } from "./kyc-approve-button";
import { KycRejectDialog } from "./kyc-reject-dialog";
import { RoleGate } from "@/components/layout/role-gate";
import { ImagePreview } from "@/components/shared/image-preview";
import { fullName } from "@/lib/format";
import { isImageUrl } from "@/lib/media";
import type { KycDetail } from "@/lib/types/kyc";

/** Sensitive value, masked until the admin explicitly reveals it. */
function SensitiveField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const [shown, setShown] = useState(false);
  if (!value) {
    return (
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">—</p>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <code className="rounded bg-muted px-2 py-1.5 font-mono text-sm tracking-wider">
          {shown ? value : "•".repeat(Math.max(value.length, 8))}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? `Hide ${label}` : `Reveal ${label}`}
        >
          {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </Button>
        {shown ? <CopyButton value={value} label={label} /> : null}
      </div>
    </div>
  );
}

function DocImage({
  label,
  url,
}: {
  label: string;
  url: string | null | undefined;
}) {
  if (!isImageUrl(url)) {
    return <p className="text-sm text-muted-foreground">No {label.toLowerCase()} submitted.</p>;
  }
  return <ImagePreview src={url} alt={label} imgClassName="aspect-square w-full" />;
}

export function KycDetailView({ kyc }: { kyc: KycDetail }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const isPending = kyc.status === "PENDING";

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <ShieldAlert className="size-4" />
        <AlertTitle>Sensitive PII — your view is logged</AlertTitle>
        <AlertDescription>
          This page displays identity data. Do not screenshot or share it. Every
          access is recorded to the audit trail.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applicant</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList>
                <DetailRow label="Name">{fullName(kyc)}</DetailRow>
                <DetailRow label="Email">{kyc.email}</DetailRow>
                <DetailRow label="Status">
                  <KycStatusBadge status={kyc.status} />
                </DetailRow>
                <DetailRow label="Submitted">
                  <DateTimeDisplay value={kyc.submittedAt} />
                </DetailRow>
                {kyc.reviewedAt ? (
                  <DetailRow label="Reviewed">
                    <DateTimeDisplay value={kyc.reviewedAt} />
                  </DetailRow>
                ) : null}
              </DetailList>
              {kyc.rejectionReason ? (
                <Alert variant="destructive" className="mt-4">
                  <XCircle className="size-4" />
                  <AlertTitle>Previously rejected</AlertTitle>
                  <AlertDescription>{kyc.rejectionReason}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identity numbers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {kyc.hasBvn || kyc.bvn ? (
                <SensitiveField label="BVN" value={kyc.bvn} />
              ) : (
                <p className="text-sm text-muted-foreground">No BVN submitted.</p>
              )}
              {kyc.hasNin || kyc.nin ? (
                <SensitiveField label="NIN" value={kyc.nin} />
              ) : (
                <p className="text-sm text-muted-foreground">No NIN submitted.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Selfie</CardTitle>
            </CardHeader>
            <CardContent>
              <DocImage label="Selfie" url={kyc.selfieUrl} />
            </CardContent>
          </Card>

          {isPending ? (
            <RoleGate cap="kyc.review">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Decision</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <KycApproveButton userId={kyc.userId} />
                  <Separator className="my-1" />
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setRejectOpen(true)}
                  >
                    <XCircle className="size-4" /> Reject
                  </Button>
                </CardContent>
              </Card>
            </RoleGate>
          ) : null}
        </div>
      </div>

      <KycRejectDialog
        userId={kyc.userId}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />
    </div>
  );
}
