import { apiDelete, apiGet, apiPatch, apiPost, qs } from "./client";
import type {
  CreateNetworkBody,
  NetworkEntity,
  NetworksListResponse,
  UpdateNetworkBody,
} from "@/lib/types/network";

export type ListNetworksParams = {
  page?: number;
  pageSize?: number;
};

export function listNetworks(params: ListNetworksParams = {}) {
  return apiGet<NetworksListResponse>(`/admin/networks${qs(params)}`);
}

export function getNetwork(id: string) {
  return apiGet<NetworkEntity>(`/admin/networks/${id}`);
}

export function createNetwork(body: CreateNetworkBody) {
  return apiPost<NetworkEntity>(`/admin/networks`, body);
}

export function updateNetwork(id: string, body: UpdateNetworkBody) {
  return apiPatch<NetworkEntity>(`/admin/networks/${id}`, body);
}

export function setNetworkEnabled(id: string, enabled: boolean) {
  return apiPatch<NetworkEntity>(`/admin/networks/${id}/enabled`, { enabled });
}

export function deleteNetwork(id: string) {
  return apiDelete<null>(`/admin/networks/${id}`);
}
