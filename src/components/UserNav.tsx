"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, currentEmail } from "@/lib/auth";

export function UserNav() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const sync = () => setEmail(currentEmail());
    sync();
    window.addEventListener("evt-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("evt-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const signOut = () => {
    clearToken();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/cart" className="hover:text-indigo-600">
        Cart
      </Link>
      {email ? (
        <>
          <span className="hidden max-w-[12rem] truncate text-zinc-500 sm:inline">
            {email}
          </span>
          <button
            onClick={signOut}
            className="rounded-full border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
