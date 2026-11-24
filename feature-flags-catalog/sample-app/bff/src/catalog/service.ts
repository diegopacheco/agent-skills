import type { FeatureFlags } from "../flags.ts";
import type { Backend } from "./backend.ts";
import type { Catalog, CheckoutMode, Product } from "./types.ts";

export type Clock = { now(): number };

function cheapest(products: readonly Product[], count: number): readonly Product[] {
  return [...products].sort((a, b) => a.price - b.price).slice(0, count);
}

export function catalogService(backend: Backend, flags: FeatureFlags, clock: Clock, ttlMs: number) {
  const cache = new Map<string, { readonly at: number; readonly products: readonly Product[] }>();

  async function products(region: string): Promise<{ products: readonly Product[]; cached: boolean }> {
    const hit = cache.get(region);
    if (flags.isEnabled("response-cache") && hit && clock.now() - hit.at < ttlMs) return { products: hit.products, cached: true };
    const fresh = await backend.products(region);
    cache.set(region, { at: clock.now(), products: fresh });
    return { products: fresh, cached: false };
  }

  return {
    async catalog(region: string): Promise<Catalog> {
      const { products: list, cached } = await products(region);
      const recommendations = flags.isEnabled("recommendations") ? cheapest(list, 2) : [];
      return { region, products: list, recommendations, cached };
    },
    checkoutMode: (): Promise<CheckoutMode> => backend.checkoutMode(),
  };
}

export type CatalogService = ReturnType<typeof catalogService>;
