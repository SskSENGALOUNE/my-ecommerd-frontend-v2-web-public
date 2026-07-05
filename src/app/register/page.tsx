"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleButton } from "@/components/GoogleButton";
import { SiteHeader } from "@/components/SiteHeader";
import { login, register, resendOtp, verifyEmail } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      setNote(`We emailed a 6-digit code to ${form.email}.`);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const submitVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyEmail(form.email, code);
      // auto-login after a successful verification
      await login(form.email, form.password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const input =
    "rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
        {step === "form" ? (
          <>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Already have one?{" "}
              <Link href="/login" className="text-indigo-600 hover:underline">
                Sign in
              </Link>
            </p>
            <form onSubmit={submitForm} className="mt-6 flex flex-col gap-3">
              <div className="flex gap-3">
                <input required placeholder="First name" value={form.firstName} onChange={set("firstName")} className={`${input} w-full`} />
                <input required placeholder="Last name" value={form.lastName} onChange={set("lastName")} className={`${input} w-full`} />
              </div>
              <input type="email" required placeholder="Email" value={form.email} onChange={set("email")} className={input} />
              <input type="password" required placeholder="Password (min 8 chars)" minLength={8} value={form.password} onChange={set("password")} className={input} />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {loading ? "Creating…" : "Create account"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-zinc-400">
              <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              OR
              <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <GoogleButton label="Sign up with Google" />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Verify your email</h1>
            {note && <p className="mt-1 text-sm text-zinc-500">{note}</p>}
            <form onSubmit={submitVerify} className="mt-6 flex flex-col gap-3">
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${input} tracking-[0.5em]`}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {loading ? "Verifying…" : "Verify & continue"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  try {
                    await resendOtp(form.email);
                    setNote("A new code is on its way.");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not resend");
                  }
                }}
                className="text-sm text-zinc-500 hover:text-indigo-600"
              >
                Resend code
              </button>
            </form>
          </>
        )}
      </main>
    </>
  );
}
