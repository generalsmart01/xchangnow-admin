import type { TransactionType, TransactionStatus, CryptoAsset } from "./transaction";

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
  cryptoAsset: CryptoAsset;
  cryptoAmount: string;
  fiatAmount: string;
};

export type MaskedBankAccount = {
  id: string;
  userId: string;
  bankName: string;
  accountNumberMasked: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
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
  bankAccount?: MaskedBankAccount;
};

export type PayoutsListResponse = {
  payouts: Payout[];
  total: number;
  page: number;
  pageSize: number;
};

export type UpdatePayoutStatusBody = {
  status: PayoutStatus;
  reference?: string;
  failureReason?: string;
};
