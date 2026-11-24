import type { HttpClient } from "../http.ts";
import { parseCheckoutMode, parseProducts } from "./parse.ts";
import type { CheckoutMode, Product } from "./types.ts";

export type Backend = {
  products(region: string): Promise<readonly Product[]>;
  checkoutMode(): Promise<CheckoutMode>;
};

export function backendGateway(http: HttpClient): Backend {
  return {
    products: (region) => http.getJson(`/api/products?region=${encodeURIComponent(region)}`, parseProducts),
    checkoutMode: () => http.getJson("/api/checkout/mode", parseCheckoutMode),
  };
}
