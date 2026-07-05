// Storefront landing page — wired to product-service's public Shop API
// (`GET /shop/products`, `/shop/categories`, `/shop/banners`).
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import {
  currency,
  getShopBanners,
  getShopCategories,
  getShopProducts,
  type ShopBanner,
  type ShopCategory,
  type ShopProduct,
} from "@/lib/shop";

export const dynamic = "force-dynamic";

function BannerStrip({ banners }: { banners: ShopBanner[] }) {
  if (banners.length === 0) return null;
  const [hero, ...rest] = banners;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <BannerTile banner={hero} className="sm:col-span-3" tall />
        {rest.slice(0, 3).map((b) => (
          <BannerTile key={b.id} banner={b} />
        ))}
      </div>
    </section>
  );
}

function BannerTile({
  banner,
  className = "",
  tall = false,
}: {
  banner: ShopBanner;
  className?: string;
  tall?: boolean;
}) {
  const inner = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={banner.imageUrl}
      alt={banner.title}
      className={`w-full rounded-xl object-cover ${tall ? "h-48 sm:h-64" : "h-32"}`}
    />
  );
  return (
    <div className={className}>
      {banner.linkUrl ? <a href={banner.linkUrl}>{inner}</a> : inner}
    </div>
  );
}

function CategoryFilter({
  categories,
  active,
  search,
}: {
  categories: ShopCategory[];
  active?: string;
  search?: string;
}) {
  if (categories.length === 0) return null;
  const q = (categoryId?: string) => {
    const p = new URLSearchParams();
    if (categoryId) p.set("categoryId", categoryId);
    if (search) p.set("search", search);
    const s = p.toString();
    return s ? `/?${s}#products` : "/#products";
  };
  const chip = (key: string, label: string, isActive: boolean, href: string) => (
    <a
      key={key}
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm transition ${
        isActive
          ? "bg-indigo-600 text-white"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      {label}
    </a>
  );
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {chip("all", "All", !active, q(undefined))}
      {categories.map((c) => chip(c.id, c.name, active === c.id, q(c.id)))}
    </div>
  );
}

function SearchBox({ search }: { search?: string }) {
  return (
    <form action="/" method="get" className="mb-6 flex gap-2">
      <input
        type="search"
        name="search"
        defaultValue={search}
        placeholder="Search products…"
        className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
      />
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black"
      >
        Search
      </button>
    </form>
  );
}

function ProductCard({ product }: { product: ShopProduct }) {
  const initial = product.name.charAt(0).toUpperCase();
  return (
    <Link
      href={`/product/${product.id}`}
      className="group rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex aspect-square items-center justify-center rounded-lg bg-linear-to-br from-indigo-100 to-zinc-100 text-5xl font-bold text-indigo-400 dark:from-indigo-950 dark:to-zinc-900">
        {initial}
      </div>
      <h3 className="mt-3 truncate font-medium group-hover:text-indigo-600">
        {product.name}
      </h3>
      <div className="mt-1">
        <span className="font-semibold text-indigo-600">
          {currency.format(product.price)}
        </span>
      </div>
    </Link>
  );
}

function Pagination({
  page,
  totalPages,
  make,
}: {
  page: number;
  totalPages: number;
  make: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-3 text-sm">
      {page > 1 ? (
        <a href={make(page - 1)} className="rounded-lg border px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900">
          ← Prev
        </a>
      ) : (
        <span className="rounded-lg border px-3 py-1.5 opacity-40">← Prev</span>
      )}
      <span className="text-zinc-500">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <a href={make(page + 1)} className="rounded-lg border px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900">
          Next →
        </a>
      ) : (
        <span className="rounded-lg border px-3 py-1.5 opacity-40">Next →</span>
      )}
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const categoryId = sp.categoryId;
  const search = sp.search;

  let products: ShopProduct[] = [];
  let categories: ShopCategory[] = [];
  let banners: ShopBanner[] = [];
  let totalPages = 1;
  let failed = false;

  try {
    const [prodRes, catRes, bannerRes] = await Promise.all([
      getShopProducts({ page, categoryId, search }),
      getShopCategories(),
      getShopBanners(),
    ]);
    products = prodRes?.items ?? [];
    totalPages = prodRes?.pagination.totalPages ?? 1;
    categories = catRes ?? [];
    banners = bannerRes ?? [];
  } catch {
    failed = true;
  }

  const makePage = (p: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (search) params.set("search", search);
    params.set("page", String(p));
    return `/?${params.toString()}#products`;
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {!search && !categoryId && <BannerStrip banners={banners} />}

        <section id="products" className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-6 text-2xl font-semibold">
            {search ? `Results for “${search}”` : "Browse products"}
          </h2>

          <SearchBox search={search} />
          <CategoryFilter
            categories={categories}
            active={categoryId}
            search={search}
          />

          {failed ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Couldn’t reach the shop right now. Is product-service running on{" "}
              <code>:3001</code>?
            </p>
          ) : products.length === 0 ? (
            <p className="text-zinc-500">No products found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} make={makePage} />
            </>
          )}
        </section>
      </main>
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} EveVthingShop. All rights reserved.
      </footer>
    </>
  );
}
