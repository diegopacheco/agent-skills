import { http } from "../../http";
import { parseCatalog, parseCheckoutMode } from "./parse";
import type { Region } from "./types";

export const catalogApi = {
  catalog: (region: Region) => http.get(`/catalog?region=${region}`, parseCatalog),
  checkoutMode: () => http.get("/checkout/mode", parseCheckoutMode),
};
