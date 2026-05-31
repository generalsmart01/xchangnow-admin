import type { EmbeddedAsset } from "./asset";

/**
 * Rates are a time-series keyed by assetId; each POST appends a new snapshot.
 * (There is no `/rates/current` endpoint — "current" is derived FE-side as the
 * newest snapshot per asset.)
 */
export type RateSnapshot = {
  id: string;
  assetId: string;
  fiatCurrency: string;
  buyRate: string;
  sellRate: string;
  source: string;
  isManualOverride: boolean;
  updatedById: string | null;
  fetchedAt: string;
  asset?: EmbeddedAsset;
};

export type RatesListResponse = {
  rates: RateSnapshot[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateRateBody = {
  assetId: string;
  buyRate: string;
  sellRate: string;
  fiatCurrency?: string;
  source?: string;
};

/** Typo-fix only — asset & fiatCurrency immutable. */
export type UpdateRateBody = {
  buyRate?: string;
  sellRate?: string;
  source?: string;
};
