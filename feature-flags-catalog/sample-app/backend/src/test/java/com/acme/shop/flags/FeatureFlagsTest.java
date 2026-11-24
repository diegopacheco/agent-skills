package com.acme.shop.flags;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import org.junit.jupiter.api.Test;

class FeatureFlagsTest {

    @Test
    void undeclaredFlagIsOffSoAGhostFlagCanNeverTurnACodePathOnByAccident() {
        FeatureFlags flags = new FeatureFlags(new FeatureProperties(Map.of("bulk-export", true)));
        assertFalse(flags.isEnabled("fast-checkout"));
    }

    @Test
    void declaredFlagReturnsItsConfiguredValue() {
        FeatureFlags flags = new FeatureFlags(new FeatureProperties(Map.of("bulk-export", true, "region-us", false)));
        assertTrue(flags.isEnabled("bulk-export"));
        assertFalse(flags.isEnabled("region-us"));
    }
}
