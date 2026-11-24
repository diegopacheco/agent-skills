import { AppError } from "../errors.ts";
import type { CheckoutMode, Product } from "./types.ts";

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === "object" && raw !== null;
}

function parseProduct(raw: unknown): Product {
  if (isRecord(raw) && typeof raw.id === "string" && typeof raw.name === "string" && typeof raw.listPrice === "number" && typeof raw.price === "number" && (raw.engine === "new" || raw.engine === "classic") && typeof raw.regional === "boolean") {
    return { id: raw.id, name: raw.name, listPrice: raw.listPrice, price: raw.price, engine: raw.engine, regional: raw.regional };
  }
  throw new AppError(502, "invalid product from backend");
}

export function parseProducts(raw: unknown): readonly Product[] {
  if (!Array.isArray(raw)) throw new AppError(502, "invalid products from backend");
  return raw.map(parseProduct);
}

export function parseCheckoutMode(raw: unknown): CheckoutMode {
  if (isRecord(raw) && (raw.mode === "fast" || raw.mode === "standard")) return { mode: raw.mode };
  throw new AppError(502, "invalid checkout mode from backend");
}
