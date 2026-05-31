import type { EmbeddedNetwork } from "./network";
import type { EmbeddedAsset } from "./asset";

/**
 * Per-pair config layered on top of an existing asset + network: contract
 * address, decimals override, deposit/withdrawal mins, fee, confirmations.
 */
export type AssetNetworkPair = {
  id: string;
  assetId: string;
  networkId: string;
  contractAddress: string | null;
  /** Decimals override; null inherits from the parent asset. */
  decimals: number | null;
  minDeposit: string | null;
  minWithdrawal: string | null;
  withdrawalFee: string | null;
  confirmationsRequired: number | null;
  isEnabled: boolean;
  network?: EmbeddedNetwork;
  asset?: EmbeddedAsset;
  createdAt: string;
  updatedAt: string;
};

/** assetNetwork as embedded by wallets / transactions / payouts. */
export type EmbeddedAssetNetwork = {
  id: string;
  asset: EmbeddedAsset;
  network: EmbeddedNetwork;
};

/** Body for attaching a network to an asset (also used inline on asset create). */
export type CreateAssetNetworkBody = {
  networkId: string;
  contractAddress?: string | null;
  decimals?: number | null;
  minDeposit?: string | null;
  minWithdrawal?: string | null;
  withdrawalFee?: string | null;
  confirmationsRequired?: number | null;
  isEnabled?: boolean;
};

/** `networkId` is immutable on an existing pair. */
export type UpdateAssetNetworkBody = {
  contractAddress?: string | null;
  decimals?: number | null;
  minDeposit?: string | null;
  minWithdrawal?: string | null;
  withdrawalFee?: string | null;
  confirmationsRequired?: number | null;
  isEnabled?: boolean;
};
