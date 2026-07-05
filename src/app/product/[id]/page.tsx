// Product detail page — wired to `GET /shop/products/:id`.
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { AddToCartButton } from "@/components/AddToCartButton";
import {
  currency,
  getShopProduct,
  type ShopImage,
  type ShopVariant,
} from "@/lib/shop";

export const dynamic = "force-dynamic";

function Gallery({ images, name }: { images: ShopImage[]; name: string }) {
  const primary =
    images.find((i) => i.isPrimary) ?? images[0] ?? null;
  return (
    <div>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
        {primary ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.url}
            alt={primary.alt ?? name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-7xl font-bold text-indigo-300">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.url}
              alt={img.alt ?? name}
              className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Variants({ variants }: { variants: ShopVariant[] }) {
  if (variants.length === 0) return null;
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-sm font-semibold text-zinc-500">Options</h2>
      <div className="flex flex-col gap-2">
        {variants.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            <span>
              {v.size ?? "Default"}{" "}
              <span className="text-zinc-400">({v.sku})</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-zinc-500">
                {v.stock > 0 ? `${v.stock} in stock` : "Out of stock"}
              </span>
              {v.price != null && (
                <span className="font-medium text-indigo-600">
                  {currency.format(v.price)}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getShopProduct(id);
  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <Gallery images={product.images} name={product.name} />

          <div>
            {product.category && (
              <span className="text-sm text-indigo-600">
                {product.category.name}
              </span>
            )}
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-semibold text-indigo-600">
              {currency.format(product.price)}
            </p>
            {product.description && (
              <p className="mt-4 whitespace-pre-line text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
            )}

            <Variants variants={product.variants} />

            <AddToCartButton productId={product.id} unitPrice={product.price} />
          </div>
        </div>
      </main>
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} EveVthingShop. All rights reserved.
      </footer>
    </>
  );
}
