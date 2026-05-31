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
  "DEACTIVATED",
  "ANONYMIZED",
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Statuses an admin may filter the users list by. */
export const USER_FILTER_STATUSES: UserStatus[] = [
  "ACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
  "DEACTIVATED",
];

/** Admin-facing user. Full phone number is returned. */
export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  role: Role;
  status: UserStatus;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

/** The authenticated admin's own profile — same shape. */
export type SelfUser = AdminUser;

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
