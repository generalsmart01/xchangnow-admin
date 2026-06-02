export const KYC_STATUSES = ["PENDING", "APPROVED", "REJECTED", "NONE"] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];

/**
 * A KYC submission row (queue). The backend returns the applicant's identity
 * fields flat (not nested under `user`) and BVN/NIN presence flags. The
 * decrypted BVN/NIN + selfie live on the detail endpoint (`KycDetail`).
 */
export type KycSubmission = {
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
  submissions: KycSubmission[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Full detail — includes DECRYPTED bvn/nin + selfie. Fetching this writes a
 * pii_access_logs READ row on the backend (the most audit-worthy read).
 */
export type KycDetail = KycSubmission & {
  reviewedById: string | null;
  bvn: string | null;
  nin: string | null;
  selfieUrl: string | null;
  rejectionReason: string | null;
};

export type KycApproveBody = { notes?: string };
export type KycRejectBody = { reason: string; notes?: string };
