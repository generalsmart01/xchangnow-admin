import { apiDelete, apiGet, apiPatch, apiPost, qs } from "./client";
import type {
  Asset,
  AssetsListResponse,
  CreateAssetBody,
  UpdateAssetBody,
} from "@/lib/types/asset";
import type {
  AssetNetworkPair,
  CreateAssetNetworkBody,
  UpdateAssetNetworkBody,
} from "@/lib/types/asset-network";

export type ListAssetsParams = {
  page?: number;
  pageSize?: number;
};

export function listAssets(params: ListAssetsParams = {}) {
  return apiGet<AssetsListResponse>(`/admin/assets${qs(params)}`);
}

export function getAsset(id: string) {
  return apiGet<Asset>(`/admin/assets/${id}`);
}

export function createAsset(body: CreateAssetBody) {
  return apiPost<Asset>(`/admin/assets`, body);
}

export function updateAsset(id: string, body: UpdateAssetBody) {
  return apiPatch<Asset>(`/admin/assets/${id}`, body);
}

export function setAssetEnabled(id: string, enabled: boolean) {
  return apiPatch<Asset>(`/admin/assets/${id}/enabled`, { enabled });
}

export function deleteAsset(id: string) {
  return apiDelete<null>(`/admin/assets/${id}`);
}

// --- Asset-network pairs --------------------------------------------------

/** Attach a network to an existing asset. */
export function attachAssetNetwork(
  assetId: string,
  body: CreateAssetNetworkBody,
) {
  return apiPost<AssetNetworkPair>(`/admin/assets/${assetId}/networks`, body);
}

export function updateAssetNetwork(id: string, body: UpdateAssetNetworkBody) {
  return apiPatch<AssetNetworkPair>(`/admin/asset-networks/${id}`, body);
}

export function deleteAssetNetwork(id: string) {
  return apiDelete<null>(`/admin/asset-networks/${id}`);
}
