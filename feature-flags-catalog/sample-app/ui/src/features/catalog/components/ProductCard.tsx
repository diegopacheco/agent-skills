import type { Product } from "../types";

type ProductCardProps = { readonly product: Product; readonly showEngine: boolean };

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ProductCard({ product, showEngine }: ProductCardProps) {
  const discounted = product.price < product.listPrice;
  return (
    <article className="card">
      <h3>{product.name}</h3>
      <p className="price">
        {money.format(product.price)}
        {discounted && <s>{money.format(product.listPrice)}</s>}
      </p>
      <div className="tags">
        {showEngine && <span className={`tag tag-${product.engine}`}>{product.engine} pricing</span>}
        {product.regional && <span className="tag tag-regional">regional deal</span>}
      </div>
    </article>
  );
}
