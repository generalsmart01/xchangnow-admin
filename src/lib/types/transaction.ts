import type { EmbeddedAssetNetwork } from "./asset-network";
import type { EmbeddedAsset } from "./asset";
import type { EmbeddedNetwork } from "./network";

export const TRANSACTION_TYPES = ["BUY", "SELL", "SWAP"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = [
  "PENDING",
  "AWAITING_PAYMENT",
  "UNDER_REVIEW",
  "APPROVED",
  "COMPLETED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const PROOF_TYPES = [
  "CRYPTO_TX_HASH",
  "BANK_TRANSFER_RECEIPT",
  "OTHER",
] as const;
export type ProofType = (typeof PROOF_TYPES)[number];

export type TransactionProof = {
  id: string;
  transactionId: string;
  type: ProofType;
  url: string;
  notes: string | null;
  uploadedAt: string;
};

/** Company wallet embedded on a transaction (now keyed by assetNetwork). */
export type EmbeddedWalletAddress = {
  id: string;
  address: string;
  label: string | null;
  isActive: boolean;
  assetNetwork?: EmbeddedAssetNetwork;
};

export type EmbeddedTxUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type Transaction = {
  id: string;
  referenceCode: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  assetNetworkId: string;
  cryptoAmount: string;
  /** SWAP destination (null otherwise). */
  toAssetNetworkId: string | null;
  toAmount: string | null;
  toAddress: string | null;
  fiatAmount: string;
  fiatCurrency: string;
  rate: string;
  walletAddressId: string | null;
  txHash: string | null;
  riskScore?: number;
  approvedById?: string | null;
  approvedAt?: string | null;
  rejectedReason?: string | null;
  expiresAt: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  assetNetwork?: EmbeddedAssetNetwork;
  toAssetNetwork?: EmbeddedAssetNetwork | null;
  proofs?: TransactionProof[];
  walletAddress?: EmbeddedWalletAddress | null;
  user?: EmbeddedTxUser;
  paymentInstructions?: string | null;
};

export type TransactionsListResponse = {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApproveBody = { notes?: string };
export type RejectBody = { reason: string };
export type MarkCompletedBody = { outboundTxHash: string; notes?: string };

/** Display helpers for the asset/network embedded on a transaction. */
export function assetOf(an?: EmbeddedAssetNetwork | null): EmbeddedAsset | undefined {
  return an?.asset;
}
export function networkOf(an?: EmbeddedAssetNetwork | null): EmbeddedNetwork | undefined {
  return an?.network;
}
