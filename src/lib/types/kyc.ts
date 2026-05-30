export const KYC_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "NOT_SUBMITTED",
] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];

/** Row in the review queue (no decrypted PII). */
export type KycQueueItem = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: KycStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  hasBvn: boolean;
  hasNin: boolean;
};

export type KycQueueResponse = {
  submissions: KycQueueItem[];
  total: number;
  page: number;
  pageSize: number;
};

/** Full detail — includes DECRYPTED bvn/nin. Fetching this writes a PII access log. */
export type KycDetail = KycQueueItem & {
  reviewedById: string | null;
  bvn: string | null;
  nin: string | null;
  selfieUrl: string | null;
  rejectionReason: string | null;
};

export type KycRejectBody = { reason: string };
