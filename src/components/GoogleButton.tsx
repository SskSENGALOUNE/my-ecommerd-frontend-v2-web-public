"use client";
import { startGoogleLogin } from "@/lib/auth";

/**
 * "Continue with Google" button. Navigates the browser to auth-service's
 * `/auth/google`, which handles the OAuth handshake and redirects back to
 * `/auth/callback` with tokens.
 */
export function GoogleButton({
  label = "Continue with Google",
  next,
}: {
  label?: string;
  next?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => startGoogleLogin(next)}
      className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      <svg aria-hidden="true" viewBox="0 0 18 18" className="h-5 w-5">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
        />
      </svg>
      {label}
    </button>
  );
}
