"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingBlock } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { KycDetailView } from "@/components/kyc/kyc-detail-view";
import { getKycDetail } from "@/lib/api/kyc";
import { ApiError } from "@/lib/api/client";

export default function KycDetailPage() {
  const { userId } = useParams<{ userId: string }>();

  const { data: kyc, isLoading, error } = useQuery({
    queryKey: ["kyc", userId],
    // Decrypts BVN/NIN and writes a pii_access_logs READ row on the backend.
    queryFn: () => getKycDetail(userId).then((r) => r.data),
    // Sensitive — don't keep it cached/fresh in the background.
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/kyc">
          <ArrowLeft className="size-4" /> Back to queue
        </Link>
      </Button>

      {isLoading ? (
        <LoadingBlock label="Decrypting submission…" />
      ) : error || !kyc ? (
        <EmptyState
          icon={XCircle}
          title={
            error instanceof ApiError && error.status === 404
              ? "Submission not found"
              : "Couldn't load submission"
          }
          description={
            error instanceof ApiError ? error.message : "Please try again."
          }
          action={
            <Button variant="outline" asChild>
              <Link href="/admin/kyc">
                <ArrowLeft className="size-4" /> Back to queue
              </Link>
            </Button>
          }
        />
      ) : (
        <KycDetailView kyc={kyc} />
      )}
    </div>
  );
}
