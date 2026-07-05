"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart, AuthRequiredError } from "@/lib/orderApi";
import { getToken } from "@/lib/auth";

export function AddToCartButton({
  productId,
  unitPrice,
}: {
  productId: string;
  unitPrice: number;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "added">("idle");
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    if (!getToken()) {
      router.push(`/login?next=/product/${productId}`);
      return;
    }
    setState("loading");
    try {
      await addToCart(productId, unitPrice, 1);
      setState("added");
      setTimeout(() => setState("idle"), 1500);
    } catch (e) {
      if (e instanceof AuthRequiredError) {
        router.push(`/login?next=/product/${productId}`);
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to add to cart");
      setState("idle");
    }
  };

  return (
    <div className="mt-8">
      <button
        onClick={onClick}
        disabled={state === "loading"}
        className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
      >
        {state === "loading"
          ? "Adding…"
          : state === "added"
            ? "✓ Added to cart"
            : "Add to cart"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
