import { ApiError } from "../../http";
import type { Catalog, CheckoutMode, Product, Region } from "./types";

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === "object" && raw !== null;
}

function parseProduct(raw: unknown): Product {
  if (isRecord(raw) && typeof raw.id === "string" && typeof raw.name === "string" && typeof raw.listPrice === "number" && typeof raw.price === "number" && (raw.engine === "new" || raw.engine === "classic") && typeof raw.regional === "boolean") {
    return { id: raw.id, name: raw.name, listPrice: raw.listPrice, price: raw.price, engine: raw.engine, regional: raw.regional };
  }
  throw new ApiError(422, "invalid product");
}

function parseRegion(raw: unknown): Region {
  if (raw === "eu" || raw === "us") return raw;
  throw new ApiError(422, "invalid region");
}

export function parseCatalog(raw: unknown): Catalog {
  if (isRecord(raw) && Array.isArray(raw.products) && Array.isArray(raw.recommendations) && typeof raw.cached === "boolean") {
    return { region: parseRegion(raw.region), products: raw.products.map(parseProduct), recommendations: raw.recommendations.map(parseProduct), cached: raw.cached };
  }
  throw new ApiError(422, "invalid catalog");
}

export function parseCheckoutMode(raw: unknown): CheckoutMode {
  if (isRecord(raw) && (raw.mode === "fast" || raw.mode === "standard")) return { mode: raw.mode };
  throw new ApiError(422, "invalid checkout mode");
}
