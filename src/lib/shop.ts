/**
 * Typed client for product-service's public Shop API (`/shop/*`).
 * Unwraps the `{ success, data }` response envelope used by all services.
 */
import { api } from "./api";

export interface ShopProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string | null;
}

export interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface ShopBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
}

export interface ShopVariant {
  id: string;
  sku: string;
  size: string | null;
  colorId: string | null;
  price: number | null;
  stock: number;
}

export interface ShopImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ShopProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: { id: string; name: string; slug: string } | null;
  variants: ShopVariant[];
  images: ShopImage[];
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Envelope<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

/** Fetch + unwrap the envelope. Returns `null` on a 404, throws on other errors. */
async function shopFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T | null> {
  const url = new URL(`${api.product}/shop${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }
  // Storefront wants fresh data; Next 16 fetch is uncached by default.
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (res.status === 404) return null;
  const body = (await res.json()) as Envelope<T>;
  if (!res.ok || !body.success) {
    throw new Error(body.error?.message ?? `Shop API error (${res.status})`);
  }
  return body.data;
}

export function getShopProducts(opts: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}): Promise<Paginated<ShopProduct> | null> {
  return shopFetch<Paginated<ShopProduct>>("/products", {
    page: opts.page ?? 1,
    limit: opts.limit ?? 12,
    categoryId: opts.categoryId,
    search: opts.search,
  });
}

export function getShopProduct(id: string): Promise<ShopProductDetail | null> {
  return shopFetch<ShopProductDetail>(`/products/${id}`);
}

export function getShopCategories(): Promise<ShopCategory[] | null> {
  return shopFetch<ShopCategory[]>("/categories");
}

export function getShopBanners(): Promise<ShopBanner[] | null> {
  return shopFetch<ShopBanner[]>("/banners");
}

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
});
