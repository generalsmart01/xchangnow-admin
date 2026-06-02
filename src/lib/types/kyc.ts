import type { AdminUser } from "./user";

export const KYC_STATUSES = ["PENDING", "APPROVED", "REJECTED", "NONE"] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];

export const KYC_DOCUMENT_TYPES = [
  "DRIVERS_LICENSE",
  "NATIONAL_ID",
  "PASSPORT",
  "VOTERS_CARD",
] as const;
export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

/**
 * A KYC submission. The queue embeds a minimal user; the detail endpoint joins
 * the full SafeUser. Fetching the detail writes a pii_access_logs READ row.
 */
export type KycSubmission = {
  userId: string;
  /** May be absent if the underlying user record is unavailable. */
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  } & Partial<AdminUser>;
  kycStatus: KycStatus;
  /** Document fields are populated on the detail endpoint; the queue may omit them. */
  documentType?: KycDocumentType | string | null;
  documentNumber?: string | null;
  documentImageUrl?: string | null;
  selfieImageUrl?: string | null;
  /** ISO date (no time), e.g. "1995-04-12". */
  dateOfBirth?: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  rejectedReason?: string | null;
};

export type KycQueueResponse = {
  submissions: KycSubmission[];
  total: number;
  page: number;
  pageSize: number;
};

/** Returned by approve/reject — the post-review state. */
export type KycReviewResult = {
  userId: string;
  kycStatus: KycStatus;
  reviewedAt: string;
  reviewedById: string;
  rejectedReason?: string | null;
};

export type KycApproveBody = { notes?: string };
export type KycRejectBody = { reason: string; notes?: string };
