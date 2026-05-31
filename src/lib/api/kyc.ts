import { apiGet, apiPost, qs } from "./client";
import type {
  KycApproveBody,
  KycQueueResponse,
  KycRejectBody,
  KycReviewResult,
  KycSubmission,
  KycStatus,
} from "@/lib/types/kyc";

export type ListKycParams = {
  page?: number;
  pageSize?: number;
  status?: KycStatus | "";
};

export function listKyc(params: ListKycParams) {
  return apiGet<KycQueueResponse>(`/kyc${qs(params)}`);
}

/** Fetches the full submission (document + selfie URLs) — writes a PII access log. */
export function getKycDetail(userId: string) {
  return apiGet<KycSubmission>(`/kyc/${userId}`);
}

export function approveKyc(userId: string, body: KycApproveBody = {}) {
  return apiPost<KycReviewResult>(`/kyc/${userId}/approve`, body);
}

export function rejectKyc(userId: string, body: KycRejectBody) {
  return apiPost<KycReviewResult>(`/kyc/${userId}/reject`, body);
}
