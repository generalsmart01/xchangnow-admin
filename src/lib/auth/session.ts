import "server-only";
import { cookies } from "next/headers";
import { COOKIES, COOKIE_MAX_AGE } from "@/lib/constants";

export type BackendTokens = {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn?: string;
  refreshExpiresIn?: string;
};

const isProd = process.env.NODE_ENV === "production";

/** Persist backend tokens as httpOnly cookies on the response. */
export async function setAuthCookies(tokens: BackendTokens) {
  const store = await cookies();
  store.set(COOKIES.access, tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE.access,
  });
  store.set(COOKIES.refresh, tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE.refresh,
  });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(COOKIES.access);
  store.delete(COOKIES.refresh);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIES.access)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIES.refresh)?.value;
}
