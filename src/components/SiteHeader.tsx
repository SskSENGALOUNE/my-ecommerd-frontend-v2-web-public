import Link from "next/link";
import { UserNav } from "./UserNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Eve<span className="text-indigo-600">V</span>thingShop
        </Link>
        <UserNav />
      </div>
    </header>
  );
}
