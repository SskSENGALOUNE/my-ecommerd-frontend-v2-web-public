"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setRefreshToken, setToken, takeGoogleNext } from "@/lib/auth";

/**
 * Landing page for the Google OAuth redirect. auth-service sends the browser
 * here as `/auth/callback?accessToken=&refreshToken=` after a successful login.
 * We persist the tokens, then forward to wherever the user was headed.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken) {
      setError(params.get("error") ?? "Sign-in was cancelled or failed.");
      return;
    }

    setToken(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);

    const next = takeGoogleNext();
    router.replace(next);
    router.refresh();
  }, [router]);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      {error ? (
        <>
          <h1 className="text-lg font-semibold text-red-600">Sign-in failed</h1>
          <p className="mt-1 text-sm text-zinc-500">{error}</p>
          <a href="/login" className="mt-4 text-sm text-indigo-600 hover:underline">
            Back to sign in
          </a>
        </>
      ) : (
        <p className="text-sm text-zinc-500">Signing you in…</p>
      )}
    </main>
  );
}
