package com.acme;

import com.launchdarkly.sdk.LDContext;
import com.launchdarkly.sdk.server.LDClient;
import org.ff4j.FF4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "features", name = "express-shipping", havingValue = "true")
public class Checkout {
    private static final String CHECKOUT_FLAG = "checkout-v2";
    private final LDClient ldClient;
    private final FF4j ff4j;

    public Checkout(LDClient ldClient, FF4j ff4j) {
        this.ldClient = ldClient;
        this.ff4j = ff4j;
    }

    public String flow(LDContext ctx) {
        if (ldClient.boolVariation(CHECKOUT_FLAG, ctx, false)) {
            return "v2";
        }
        if (ff4j.check("legacy-cart")) {
            return "legacy";
        }
        if (MyFeatures.NEW_SEARCH.isActive()) {
            return "search";
        }
        return "v1";
    }
}
