import { apiGet, apiPost, qs } from "./client";
import type {
  CreateRateBody,
  CurrentRatesResponse,
  RateSnapshot,
  RatesListResponse,
} from "@/lib/types/rate";
import type { CryptoAsset } from "@/lib/types/transaction";

export function getCurrentRates() {
  return apiGet<CurrentRatesResponse>(`/rates/current`);
}

export type ListRatesParams = {
  asset?: CryptoAsset | "";
  page?: number;
  pageSize?: number;
};

export function listRates(params: ListRatesParams) {
  return apiGet<RatesListResponse>(`/rates${qs(params)}`);
}

export function createRate(body: CreateRateBody) {
  return apiPost<RateSnapshot>(`/rates`, body);
}
