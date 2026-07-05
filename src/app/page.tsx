// Storefront landing page.
// NOTE: product data is placeholder for now — wire it to the public Shop API
// (`GET {NEXT_PUBLIC_PRODUCT_API_URL}/shop/products`) once that endpoint exists
// in product-service (see api/product-service/PLAN.md, Phase 5).

const SAMPLE_PRODUCTS = [
  { id: "1", name: "Wireless Mouse", price: 29.99, emoji: "🖱️" },
  { id: "2", name: "Mechanical Keyboard", price: 89.0, emoji: "⌨️" },
  { id: "3", name: "USB-C Hub", price: 45.5, emoji: "🔌" },
  { id: "4", name: "Noise-Cancelling Headphones", price: 199.0, emoji: "🎧" },
  { id: "5", name: "Webcam 1080p", price: 59.9, emoji: "📷" },
  { id: "6", name: "Desk Lamp", price: 34.0, emoji: "💡" },
  { id: "7", name: "Laptop Stand", price: 39.0, emoji: "💻" },
  { id: "8", name: "Portable SSD 1TB", price: 119.0, emoji: "💾" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
});

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <span className="text-xl font-bold tracking-tight">
          Eve<span className="text-indigo-600">V</span>thingShop
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <a className="hover:text-indigo-600" href="#products">
            Products
          </a>
          <a
            className="rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            href="/login"
          >
            Sign in
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
      <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        Everything you need, in one shop.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Browse our catalog and check out in seconds.
      </p>
      <a
        href="#products"
        className="mt-8 inline-block rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
      >
        Shop now
      </a>
    </section>
  );
}

function ProductCard({
  product,
}: {
  product: (typeof SAMPLE_PRODUCTS)[number];
}) {
  return (
    <div className="group rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex aspect-square items-center justify-center rounded-lg bg-zinc-100 text-5xl dark:bg-zinc-900">
        {product.emoji}
      </div>
      <h3 className="mt-3 truncate font-medium">{product.name}</h3>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-indigo-600 font-semibold">
          {currency.format(product.price)}
        </span>
        <button className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300">
          Add
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <section id="products" className="mx-auto max-w-6xl px-4 pb-24">
          <h2 className="mb-6 text-2xl font-semibold">Featured products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SAMPLE_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} EveVthingShop. All rights reserved.
      </footer>
    </>
  );
}
