package com.acme.shop.catalog;

import com.acme.shop.flags.FeatureFlags;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PricingService {
    private static final BigDecimal NEW_ENGINE_FACTOR = new BigDecimal("0.90");
    private static final BigDecimal REGIONAL_FACTOR = new BigDecimal("0.95");
    private final ProductCatalog catalog;
    private final FeatureFlags flags;

    public PricingService(ProductCatalog catalog, FeatureFlags flags) {
        this.catalog = catalog;
        this.flags = flags;
    }

    public List<PricedProduct> priced(String region) {
        boolean newEngine = flags.isEnabled("new-pricing-engine");
        boolean regional = flags.isEnabled("region-" + region);
        return catalog.all().stream().map(p -> price(p, newEngine, regional)).toList();
    }

    private PricedProduct price(Product p, boolean newEngine, boolean regional) {
        BigDecimal value = p.price();
        if (newEngine) {
            value = value.multiply(NEW_ENGINE_FACTOR);
        }
        if (regional) {
            value = value.multiply(REGIONAL_FACTOR);
        }
        return new PricedProduct(p.id(), p.name(), p.price(), value.setScale(2, RoundingMode.HALF_EVEN), newEngine ? "new" : "classic", regional);
    }
}
