"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { getToken } from "@/lib/auth";
import {
  AuthRequiredError,
  checkout,
  getCart,
  removeCartItem,
  setCartItemQty,
  type Cart,
  type Order,
} from "@/lib/orderApi";
import { currency, getShopProduct } from "@/lib/shop";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [address, setAddress] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const c = await getCart();
      setCart(c);
      // best-effort: resolve product names for display
      const missing = c.items.map((i) => i.productId).filter((id) => !names[id]);
      if (missing.length) {
        const resolved = await Promise.all(
          missing.map(async (id) => [id, (await getShopProduct(id))?.name ?? id] as const),
        );
        setNames((prev) => ({ ...prev, ...Object.fromEntries(resolved) }));
      }
    } catch (e) {
      if (e instanceof AuthRequiredError) {
        router.push("/login?next=/cart");
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login?next=/cart");
      return;
    }
    // Data fetch: setState happens asynchronously inside load(), after awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load, router]);

  const changeQty = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setBusy(true);
    setError(null);
    try {
      setCart(await setCartItemQty(productId, quantity));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (productId: string) => {
    setBusy(true);
    setError(null);
    try {
      setCart(await removeCartItem(productId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setBusy(false);
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const o = await checkout(address);
      setOrder(o);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">Your cart</h1>

        {order ? (
          <div className="rounded-2xl border border-green-300 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
              🎉 Order placed!
            </h2>
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              Order <span className="font-mono">{order.id}</span> · status{" "}
              <b>{order.status}</b> · total {currency.format(order.totalAmount)}
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Continue shopping
            </Link>
          </div>
        ) : loading ? (
          <p className="text-zinc-500">Loading…</p>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-zinc-500">
            Your cart is empty.{" "}
            <Link href="/" className="text-indigo-600 hover:underline">
              Browse products →
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_20rem]">
            <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-zinc-100 font-bold text-indigo-400 dark:bg-zinc-900">
                    {(names[item.productId] ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {names[item.productId] ?? item.productId}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {currency.format(item.unitPrice)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQty(item.productId, item.quantity - 1)} disabled={busy || item.quantity <= 1} className="h-7 w-7 rounded border disabled:opacity-40">−</button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => changeQty(item.productId, item.quantity + 1)} disabled={busy} className="h-7 w-7 rounded border disabled:opacity-40">+</button>
                  </div>
                  <div className="w-20 text-right font-medium">
                    {currency.format(item.subtotal)}
                  </div>
                  <button onClick={() => remove(item.productId)} disabled={busy} className="text-sm text-zinc-400 hover:text-red-600">
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={placeOrder} className="h-fit rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{currency.format(cart.totalAmount)}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                {cart.totalItems} item{cart.totalItems === 1 ? "" : "s"}
              </p>
              <label className="mt-4 block text-sm font-medium">Shipping address</label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Street, city, country"
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={busy} className="mt-4 w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {busy ? "Placing order…" : "Place order"}
              </button>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
