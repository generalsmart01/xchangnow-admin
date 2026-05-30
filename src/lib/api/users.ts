import { apiGet, apiPatch, apiPost, qs } from "./client";
import type {
  AdminUser,
  AnonymizeBody,
  AnonymizeResponse,
  SelfUser,
  UpdateStatusBody,
  UsersListResponse,
  UserStatus,
} from "@/lib/types/user";

export type ListUsersParams = {
  page?: number;
  pageSize?: number;
  status?: UserStatus | "";
  search?: string;
};

export function listUsers(params: ListUsersParams) {
  return apiGet<UsersListResponse>(`/users${qs(params)}`);
}

export function getUser(id: string) {
  return apiGet<AdminUser>(`/users/${id}`);
}

export function updateUserStatus(id: string, body: UpdateStatusBody) {
  return apiPatch<AdminUser>(`/users/${id}/status`, body);
}

export function anonymizeUser(id: string, body: AnonymizeBody) {
  return apiPost<AnonymizeResponse>(`/users/${id}/anonymize`, body);
}

export function getMe() {
  return apiGet<SelfUser>(`/users/me`);
}

export function updateMe(body: Partial<
  Pick<SelfUser, "firstName" | "lastName" | "phoneNumber">
>) {
  return apiPatch<SelfUser>(`/users/me`, body);
}
