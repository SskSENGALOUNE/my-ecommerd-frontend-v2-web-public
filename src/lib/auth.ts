"use client";
// Client-side auth: stores the auth-service access token in localStorage and
// talks to auth-service (`/auth/*`). Tokens are sent as Bearer to order-service.
import { api } from "./api";

const TOKEN_KEY = "evt_access_token";
const REFRESH_TOKEN_KEY = "evt_refresh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("evt-auth-change"));
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event("evt-auth-change"));
}

const NEXT_KEY = "evt_oauth_next";

/**
 * Full URL that starts the Google OAuth flow. This is a browser navigation
 * (not fetch): auth-service redirects to Google, then back to
 * `/auth/callback?accessToken=&refreshToken=` on this site. The backend does
 * not round-trip a `next` param, so we stash the post-login destination in
 * sessionStorage and read it back in the callback page.
 */
export function startGoogleLogin(next?: string): void {
  if (next && next.startsWith("/")) sessionStorage.setItem(NEXT_KEY, next);
  else sessionStorage.removeItem(NEXT_KEY);
  window.location.href = `${api.auth}/auth/google`;
}

export function takeGoogleNext(): string {
  const next = sessionStorage.getItem(NEXT_KEY);
  sessionStorage.removeItem(NEXT_KEY);
  return next && next.startsWith("/") ? next : "/";
}

export function currentEmail(): string | null {
  const t = getToken();
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split(".")[1])) as { email?: string };
    return payload.email ?? null;
  } catch {
    return null;
  }
}

async function authPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${api.auth}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    success: boolean;
    data: T;
    error?: { code: string; message: string };
  };
  if (!res.ok || !json.success) {
    const err = new Error(json.error?.message ?? `Request failed (${res.status})`);
    (err as Error & { code?: string }).code = json.error?.code;
    throw err;
  }
  return json.data;
}

export async function login(email: string, password: string): Promise<void> {
  const data = await authPost<{ accessToken: string }>("/auth/login", {
    email,
    password,
  });
  setToken(data.accessToken);
}

export function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<unknown> {
  return authPost("/auth/register", input);
}

export function verifyEmail(email: string, code: string): Promise<unknown> {
  return authPost("/auth/verify-email", { email, code });
}

export function resendOtp(email: string): Promise<unknown> {
  return authPost("/auth/resend-otp", { email });
}
