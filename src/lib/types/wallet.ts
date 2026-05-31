import type { EmbeddedAssetNetwork } from "./asset-network";

/** Company-owned crypto wallet, now keyed by an asset-network pair. */
export type Wallet = {
  id: string;
  assetNetworkId: string;
  address: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assetNetwork?: EmbeddedAssetNetwork;
};

export type CreateWalletBody = {
  assetNetworkId: string;
  address: string;
  label?: string;
  isActive?: boolean;
};

export type UpdateWalletBody = {
  label?: string;
  isActive?: boolean;
};
