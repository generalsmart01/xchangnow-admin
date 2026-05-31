/**
 * Blockchain networks are now dynamic, admin-managed rows (no longer a fixed
 * string union). A network may be EVM (chainId set) or non-EVM (chainId null).
 */
export type NetworkEntity = {
  id: string;
  code: string;
  name: string;
  chainId: number | null;
  explorerUrlTemplate: string | null;
  nativeAssetSymbol: string | null;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type NetworksListResponse = {
  networks: NetworkEntity[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateNetworkBody = {
  code: string;
  name: string;
  chainId?: number | null;
  explorerUrlTemplate?: string | null;
  nativeAssetSymbol?: string | null;
  isEnabled?: boolean;
  sortOrder?: number;
};

/** `code` is immutable, so it is absent here. */
export type UpdateNetworkBody = {
  name?: string;
  chainId?: number | null;
  explorerUrlTemplate?: string | null;
  nativeAssetSymbol?: string | null;
  isEnabled?: boolean;
  sortOrder?: number;
};

/** Compact network shape embedded inside assets / pairs / transactions. */
export type EmbeddedNetwork = {
  id?: string;
  code: string;
  name: string;
  chainId: number | null;
};
