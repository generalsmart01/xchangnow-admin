import type { AssetNetworkPair, CreateAssetNetworkBody } from "./asset-network";

/**
 * Crypto assets are now dynamic, admin-managed rows. `symbol` and `decimals`
 * are immutable after creation.
 */
export type Asset = {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  iconUrl: string | null;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** Present on detail / create responses; lists may include it too. */
  networks?: AssetNetworkPair[];
};

export type AssetsListResponse = {
  assets: Asset[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateAssetBody = {
  symbol: string;
  name: string;
  decimals: number;
  iconUrl?: string | null;
  sortOrder?: number;
  isEnabled?: boolean;
  /** Optional initial pairs, created atomically with the asset (max 20). */
  networks?: CreateAssetNetworkBody[];
};

/** `symbol` and `decimals` are immutable, so they are absent here. */
export type UpdateAssetBody = {
  name?: string;
  iconUrl?: string | null;
  isEnabled?: boolean;
  sortOrder?: number;
};

/** Compact asset shape embedded inside pairs / wallets / transactions / rates. */
export type EmbeddedAsset = {
  id?: string;
  symbol: string;
  name: string;
  decimals: number;
  iconUrl?: string | null;
};
