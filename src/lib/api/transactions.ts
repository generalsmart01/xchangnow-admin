import { apiGet, apiPost, qs } from "./client";
import type {
  ApproveBody,
  MarkCompletedBody,
  RejectBody,
  Transaction,
  TransactionsListResponse,
  TransactionStatus,
  TransactionType,
} from "@/lib/types/transaction";

export type ListTransactionsParams = {
  page?: number;
  pageSize?: number;
  status?: TransactionStatus | "";
  type?: TransactionType | "";
  assetId?: string;
  assetNetworkId?: string;
  userId?: string;
};

export function listTransactions(params: ListTransactionsParams) {
  return apiGet<TransactionsListResponse>(`/transactions${qs(params)}`);
}

export function getTransaction(id: string) {
  return apiGet<Transaction>(`/transactions/${id}`);
}

export function approveTransaction(id: string, body: ApproveBody) {
  return apiPost<Transaction>(`/transactions/${id}/approve`, body);
}

export function rejectTransaction(id: string, body: RejectBody) {
  return apiPost<Transaction>(`/transactions/${id}/reject`, body);
}

export function markTransactionCompleted(id: string, body: MarkCompletedBody) {
  return apiPost<Transaction>(`/transactions/${id}/mark-completed`, body);
}
