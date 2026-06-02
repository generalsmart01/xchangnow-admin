import { apiGet, apiPost, qs } from "./client";
import type {
  KycApproveBody,
  KycDetail,
  KycQueueResponse,
  KycRejectBody,
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

/** Fetches the decrypted BVN/NIN + selfie — writes a PII access log. */
export function getKycDetail(userId: string) {
  return apiGet<KycDetail>(`/kyc/${userId}`);
}

export function approveKyc(userId: string, body: KycApproveBody = {}) {
  return apiPost<KycDetail>(`/kyc/${userId}/approve`, body);
}

export function rejectKyc(userId: string, body: KycRejectBody) {
  return apiPost<KycDetail>(`/kyc/${userId}/reject`, body);
}
