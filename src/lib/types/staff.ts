import type { Role, UserStatus } from "./user";

/** Roles a SUPER_ADMIN may assign when inviting / changing staff. */
export const ASSIGNABLE_STAFF_ROLES: Role[] = ["ADMIN", "OPS", "CUSTOMER_SERVICE"];

/** Staff row — leaner than AdminUser (no PII fields). */
export type StaffMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type StaffListResponse = {
  staff: StaffMember[];
  total: number;
  page: number;
  pageSize: number;
};

export type InviteStaffBody = {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

/** 201 response: the new staff member plus the invite expiry. */
export type InviteStaffResponse = StaffMember & {
  inviteExpiresAt: string;
};

export type ChangeRoleBody = {
  role: Role;
};
