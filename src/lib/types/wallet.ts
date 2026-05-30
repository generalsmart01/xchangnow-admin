import type { CryptoAsset, Network } from "./transaction";

export type Wallet = {
  id: string;
  cryptoAsset: CryptoAsset;
  network: Network;
  address: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateWalletBody = {
  cryptoAsset: CryptoAsset;
  network: Network;
  address: string;
  label?: string;
  isActive?: boolean;
};

export type UpdateWalletBody = {
  label?: string;
  isActive?: boolean;
};
