import type { AdminUser, Role } from "./user";

/** Roles a SUPER_ADMIN may assign when inviting / changing staff. */
export const ASSIGNABLE_STAFF_ROLES: Role[] = ["ADMIN", "OPS", "CUSTOMER_SERVICE"];

export type StaffListResponse = {
  staff: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
};

export type InviteStaffBody = {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phoneNumber?: string;
};

export type InviteStaffResponse = {
  user: AdminUser;
  inviteToken?: string;
};

export type ChangeRoleBody = {
  role: Role;
  reason: string;
};
