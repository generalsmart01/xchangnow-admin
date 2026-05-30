import { apiDelete, apiGet, apiPatch, apiPost, qs } from "./client";
import type {
  CreateWalletBody,
  UpdateWalletBody,
  Wallet,
} from "@/lib/types/wallet";
import type { CryptoAsset, Network } from "@/lib/types/transaction";

export type ListWalletsParams = {
  asset?: CryptoAsset | "";
  network?: Network | "";
  isActive?: boolean | "";
};

export function listWallets(params: ListWalletsParams = {}) {
  return apiGet<Wallet[]>(`/wallets${qs(params)}`);
}

export function getWallet(id: string) {
  return apiGet<Wallet>(`/wallets/${id}`);
}

export function createWallet(body: CreateWalletBody) {
  return apiPost<Wallet>(`/wallets`, body);
}

export function updateWallet(id: string, body: UpdateWalletBody) {
  return apiPatch<Wallet>(`/wallets/${id}`, body);
}

export function deactivateWallet(id: string) {
  return apiDelete<Wallet>(`/wallets/${id}`);
}
