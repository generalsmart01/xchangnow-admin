import type { CryptoAsset } from "./transaction";

export type CurrentRate = {
  asset: CryptoAsset;
  buyRate: string;
  sellRate: string;
  source: string;
  fetchedAt: string;
};

export type CurrentRatesResponse = {
  fiatCurrency: string;
  rates: CurrentRate[];
};

export type RateSnapshot = {
  id: string;
  asset: CryptoAsset;
  fiatCurrency: string;
  buyRate: string;
  sellRate: string;
  source: string;
  isManualOverride: boolean;
  updatedById: string | null;
  fetchedAt: string;
};

export type RatesListResponse = {
  rates: RateSnapshot[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateRateBody = {
  asset: CryptoAsset;
  buyRate: string;
  sellRate: string;
  fiatCurrency: string;
  source?: string;
};
