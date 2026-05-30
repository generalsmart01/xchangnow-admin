import { apiGet, apiPatch, qs } from "./client";
import type {
  Payout,
  PayoutsListResponse,
  PayoutStatus,
  UpdatePayoutStatusBody,
} from "@/lib/types/payout";

export type ListPayoutsParams = {
  page?: number;
  pageSize?: number;
  status?: PayoutStatus | "";
  userId?: string;
};

export function listPayouts(params: ListPayoutsParams) {
  return apiGet<PayoutsListResponse>(`/payouts${qs(params)}`);
}

export function getPayout(id: string) {
  return apiGet<Payout>(`/payouts/${id}`);
}

export function updatePayoutStatus(id: string, body: UpdatePayoutStatusBody) {
  return apiPatch<Payout>(`/payouts/${id}/status`, body);
}
