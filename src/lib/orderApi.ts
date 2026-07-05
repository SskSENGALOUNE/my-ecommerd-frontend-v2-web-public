"use client";
// Client-side calls to order-service (`/carts`, `/checkout`, `/orders`).
// All are JWT-guarded; the token is attached as Bearer.
import { api } from "./api";
import { clearToken, getToken } from "./auth";

export interface CartItem {
  id: string;
  productId: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
}

export class AuthRequiredError extends Error {}

async function authFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  if (!token) throw new AuthRequiredError("Please sign in.");
  const res = await fetch(`${api.order}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 401) {
    clearToken();
    throw new AuthRequiredError("Your session expired. Please sign in again.");
  }
  const json = (await res.json()) as {
    success: boolean;
    data: T;
    error?: { message: string };
  };
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? `Request failed (${res.status})`);
  }
  return json.data;
}

export const getCart = () => authFetch<Cart>("/carts");

export const addToCart = (productId: string, unitPrice: number, quantity = 1) =>
  authFetch<Cart>("/carts/items", {
    method: "POST",
    body: JSON.stringify({ productId, unitPrice, quantity }),
  });

export const setCartItemQty = (productId: string, quantity: number) =>
  authFetch<Cart>(`/carts/items/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });

export const removeCartItem = (productId: string) =>
  authFetch<Cart>(`/carts/items/${productId}`, { method: "DELETE" });

export const checkout = (shippingAddress: string) =>
  authFetch<Order>("/checkout", {
    method: "POST",
    body: JSON.stringify({ shippingAddress }),
  });
