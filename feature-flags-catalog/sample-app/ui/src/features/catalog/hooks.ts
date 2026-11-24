import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "./api";
import type { Region } from "./types";

export const catalogKeys = {
  all: ["catalog"] as const,
  region: (region: Region) => [...catalogKeys.all, region] as const,
  checkout: ["checkout-mode"] as const,
};

export function useCatalog(region: Region) {
  return useQuery({ queryKey: catalogKeys.region(region), queryFn: () => catalogApi.catalog(region) });
}

export function useCheckoutMode() {
  return useQuery({ queryKey: catalogKeys.checkout, queryFn: catalogApi.checkoutMode });
}
