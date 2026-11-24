package com.acme.shop.catalog;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.acme.shop.flags.FeatureFlags;
import com.acme.shop.flags.FeatureProperties;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.Test;

class PricingServiceTest {

    private PricedProduct keyboard(Map<String, Boolean> features, String region) {
        PricingService service = new PricingService(new ProductCatalog(), new FeatureFlags(new FeatureProperties(features)));
        return service.priced(region).getFirst();
    }

    @Test
    void newPricingEngineGivesTenPercentOffSoTurningTheFlagOffRestoresListPrice() {
        assertEquals(new BigDecimal("108.00"), keyboard(Map.of("new-pricing-engine", true), "us").price());
        assertEquals(new BigDecimal("120.00"), keyboard(Map.of("new-pricing-engine", false), "us").price());
    }

    @Test
    void regionalFlagIsLookedUpByRegionNameSoOnlyEnabledRegionsGetTheRegionalDiscount() {
        Map<String, Boolean> features = Map.of("region-eu", true, "region-us", false);
        assertEquals(new BigDecimal("114.00"), keyboard(features, "eu").price());
        assertEquals(new BigDecimal("120.00"), keyboard(features, "us").price());
    }
}
