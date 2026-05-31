import { apiGet, apiPatch, apiPost, qs } from "./client";
import type { Role, UserStatus } from "@/lib/types/user";
import type {
  ChangeRoleBody,
  InviteStaffBody,
  InviteStaffResponse,
  StaffListResponse,
  StaffMember,
} from "@/lib/types/staff";

export type ListStaffParams = {
  page?: number;
  pageSize?: number;
  role?: Role | "";
  status?: UserStatus | "";
};

export function listStaff(params: ListStaffParams) {
  return apiGet<StaffListResponse>(`/admin/staff${qs(params)}`);
}

export function getStaff(id: string) {
  return apiGet<StaffMember>(`/admin/staff/${id}`);
}

export function inviteStaff(body: InviteStaffBody) {
  return apiPost<InviteStaffResponse>(`/admin/staff`, body);
}

export function changeStaffRole(id: string, body: ChangeRoleBody) {
  return apiPatch<StaffMember>(`/admin/staff/${id}/role`, body);
}
