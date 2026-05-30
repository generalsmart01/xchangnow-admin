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

export const CRYPTO_ASSETS = ["BTC", "ETH", "USDT", "USDC"] as const;
export type CryptoAsset = (typeof CRYPTO_ASSETS)[number];

export const NETWORKS = [
  "BITCOIN",
  "ETHEREUM",
  "TRON",
  "BSC",
  "POLYGON",
] as const;
export type Network = (typeof NETWORKS)[number];

export const PROOF_TYPES = ["CRYPTO_TX_HASH", "BANK_TRANSFER_RECEIPT"] as const;
export type ProofType = (typeof PROOF_TYPES)[number];

export type TransactionProof = {
  id: string;
  transactionId: string;
  type: ProofType;
  url: string;
  notes: string | null;
  uploadedAt: string;
};

export type EmbeddedWalletAddress = {
  id: string;
  cryptoAsset: CryptoAsset;
  network: Network;
  address: string;
  label: string | null;
  isActive: boolean;
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
  cryptoAsset: CryptoAsset;
  network: Network;
  cryptoAmount: string;
  fiatAmount: string;
  fiatCurrency: string;
  rate: string;
  walletAddressId: string | null;
  txHash: string | null;
  riskScore: number;
  approvedById: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  proofs?: TransactionProof[];
  walletAddress?: EmbeddedWalletAddress | null;
  user?: EmbeddedTxUser;
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
