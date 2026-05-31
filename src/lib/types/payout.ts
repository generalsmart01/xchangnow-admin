import type { TransactionType, TransactionStatus } from "./transaction";
import type { EmbeddedAssetNetwork } from "./asset-network";

export const PAYOUT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export type EmbeddedPayoutTransaction = {
  id: string;
  referenceCode: string;
  type: TransactionType;
  status: TransactionStatus;
  assetNetworkId: string;
  cryptoAmount: string;
  fiatAmount: string;
  assetNetwork?: EmbeddedAssetNetwork;
};

/**
 * Payout bank account — full account number IS returned (the admin needs it to
 * make the transfer). Treat as sensitive PII.
 */
export type PayoutBankAccount = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export type Payout = {
  id: string;
  transactionId: string;
  bankAccountId: string;
  amount: string;
  currency: string;
  status: PayoutStatus;
  reference: string;
  failureReason: string | null;
  processedById: string | null;
  processedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  transaction?: EmbeddedPayoutTransaction;
  bankAccount?: PayoutBankAccount;
};

export type PayoutsListResponse = {
  payouts: Payout[];
  total: number;
  page: number;
  pageSize: number;
};

/** PROCESSING: {status}. PAID: {status, notes?}. FAILED: {status, failureReason}. */
export type UpdatePayoutStatusBody = {
  status: PayoutStatus;
  notes?: string;
  failureReason?: string;
};
