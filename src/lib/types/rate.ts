/**
 * FX rate — the platform is USD-pegged, so this is a single NGN-per-USD rate
 * (one row at a time, manual). Per-asset USD prices live on the Asset itself
 * (`Asset.priceUsd`), NOT here. The buy/sell spread on this FX rate is the
 * platform fee.
 *
 *   buyRate  = NGN per USD when WE sell USD  (customer BUY transactions)
 *   sellRate = NGN per USD when WE buy USD   (customer SELL transactions)
 *
 * Safety rail (backend-enforced): sellRate must be < buyRate.
 */
export type FxRate = {
  id: string;
  fiatCurrency: string;
  buyRate: string;
  sellRate: string;
  source: string;
  isManualOverride: boolean;
  updatedById: string | null;
  fetchedAt: string;
};

/** Back-compat alias — the FX rate is still a time-series snapshot. */
export type RateSnapshot = FxRate;

export type RatesListResponse = {
  rates: FxRate[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateRateBody = {
  buyRate: string;
  sellRate: string;
  fiatCurrency?: string;
  source?: string;
};

/** Typo-fix only — fiatCurrency immutable. */
export type UpdateRateBody = {
  buyRate?: string;
  sellRate?: string;
  source?: string;
};
