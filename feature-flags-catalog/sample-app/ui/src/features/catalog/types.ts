export type Region = "eu" | "us";

export type Product = {
  readonly id: string;
  readonly name: string;
  readonly listPrice: number;
  readonly price: number;
  readonly engine: "new" | "classic";
  readonly regional: boolean;
};

export type Catalog = {
  readonly region: Region;
  readonly products: readonly Product[];
  readonly recommendations: readonly Product[];
  readonly cached: boolean;
};

export type CheckoutMode = { readonly mode: "fast" | "standard" };
