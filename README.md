# web-public — EveVthingShop Storefront

Customer-facing storefront (Next.js 16, App Router, Tailwind v4). Runs on **port 5173** to match `FRONTEND_URL` (used by the auth-service Google OAuth callback).

## Develop

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_*_API_URL
npm run dev                  # http://localhost:5173
npm run build
npm run start                # serve production build on 5173
npm run lint
```

Backend base URLs come from `NEXT_PUBLIC_*_API_URL` (see [src/lib/api.ts](src/lib/api.ts)); each already includes `/api/v1`.

> The home page product grid is placeholder data — wire it to `GET {PRODUCT_API}/shop/products` once that public endpoint exists (see `api/product-service/PLAN.md`).
