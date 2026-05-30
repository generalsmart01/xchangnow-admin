export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "OPS",
  "CUSTOMER_SERVICE",
  "USER",
] as const;
export type Role = (typeof ROLES)[number];

/** Roles that may access the admin dashboard at all. */
export const ADMIN_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "OPS",
  "CUSTOMER_SERVICE",
];

export const USER_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
  "ANONYMIZED",
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Admin-facing user (phone always masked). */
export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumberMasked: string;
  role: Role;
  status: UserStatus;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

/** The authenticated admin's own profile (full phone, not masked). */
export type SelfUser = Omit<AdminUser, "phoneNumberMasked"> & {
  phoneNumber: string;
};

export type UsersListResponse = {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
};

export type UpdateStatusBody = {
  status: UserStatus;
  reason?: string;
};

export type AnonymizeBody = {
  confirmEmail: string;
  reason: string;
};

export type AnonymizeResponse = {
  message: string;
  anonymizedAt: string;
};
