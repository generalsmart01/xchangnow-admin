import { apiDelete, apiGet, apiPatch, apiPost, qs } from "./client";
import type {
  CreateRateBody,
  FxRate,
  RatesListResponse,
  UpdateRateBody,
} from "@/lib/types/rate";

export type ListRatesParams = {
  fiatCurrency?: string;
  page?: number;
  pageSize?: number;
};

export function listRates(params: ListRatesParams = {}) {
  return apiGet<RatesListResponse>(`/rates${qs(params)}`);
}

export function getRate(id: string) {
  return apiGet<FxRate>(`/rates/${id}`);
}

export function createRate(body: CreateRateBody) {
  return apiPost<FxRate>(`/rates`, body);
}

export function updateRate(id: string, body: UpdateRateBody) {
  return apiPatch<FxRate>(`/rates/${id}`, body);
}

export function deleteRate(id: string) {
  return apiDelete<null>(`/rates/${id}`);
}
