import { useState } from "react";
import { flags } from "../../../flags";
import { useCatalog, useCheckoutMode } from "../hooks";
import type { Region } from "../types";
import { ProductCard } from "./ProductCard";

const REGIONS: readonly Region[] = ["eu", "us"];

export function CatalogPage() {
  const [region, setRegion] = useState<Region>("eu");
  const catalog = useCatalog(region);
  const checkout = useCheckoutMode();
  const showEngine = flags.isEnabled("new-pricing-engine");
  const showRecommendations = flags.isEnabled("recommendations");
  return (
    <main>
      <div className="toolbar">
        {REGIONS.map((r) => (
          <button key={r} className={r === region ? "active" : ""} onClick={() => setRegion(r)}>
            {r.toUpperCase()}
          </button>
        ))}
        <span className="muted">checkout: {checkout.data?.mode ?? "..."}</span>
        {catalog.data?.cached && <span className="muted">served from cache</span>}
      </div>
      {catalog.isError && <p className="error">Could not load the catalog.</p>}
      {showRecommendations && catalog.data && catalog.data.recommendations.length > 0 && (
        <section>
          <h2>Recommended for you</h2>
          <div className="grid">
            {catalog.data.recommendations.map((p) => (
              <ProductCard key={p.id} product={p} showEngine={showEngine} />
            ))}
          </div>
        </section>
      )}
      <section>
        <h2>All products</h2>
        <div className="grid">
          {(catalog.data?.products ?? []).map((p) => (
            <ProductCard key={p.id} product={p} showEngine={showEngine} />
          ))}
        </div>
      </section>
    </main>
  );
}
