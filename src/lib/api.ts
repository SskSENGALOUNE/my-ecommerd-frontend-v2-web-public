/**
 * Backend microservice base URLs.
 *
 * Each NestJS service exposes a global `/api` prefix with URI versioning (`/v1`),
 * so these values already include `/api/v1`.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const api = {
  auth: required("NEXT_PUBLIC_AUTH_API_URL", process.env.NEXT_PUBLIC_AUTH_API_URL),
  product: required(
    "NEXT_PUBLIC_PRODUCT_API_URL",
    process.env.NEXT_PUBLIC_PRODUCT_API_URL,
  ),
  order: required("NEXT_PUBLIC_ORDER_API_URL", process.env.NEXT_PUBLIC_ORDER_API_URL),
} as const;

export type ApiService = keyof typeof api;
