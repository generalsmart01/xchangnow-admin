import { apiGet, apiPost, qs } from "./client";
import type {
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

/** Fetches DECRYPTED bvn/nin — backend writes a pii_access_logs READ row. */
export function getKycDetail(userId: string) {
  return apiGet<KycDetail>(`/kyc/${userId}`);
}

export function approveKyc(userId: string) {
  return apiPost<KycDetail>(`/kyc/${userId}/approve`);
}

export function rejectKyc(userId: string, body: KycRejectBody) {
  return apiPost<KycDetail>(`/kyc/${userId}/reject`, body);
}
