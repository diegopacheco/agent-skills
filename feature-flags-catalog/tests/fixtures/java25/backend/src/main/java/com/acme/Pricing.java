package com.acme;

import com.optimizely.ab.Optimizely;
import dev.openfeature.sdk.Client;

public record Pricing(Optimizely optimizely, Client client) {
    public String plan(String userId) {
        var decision = optimizely.createUserContext(userId).decide("pricing-v3");
        var ranked = client.getBooleanValue("search-ranking", false);
        return switch (decision.getEnabled() ? 1 : 0) {
            case 1 -> ranked ? "v3-ranked" : "v3";
            default -> "v2";
        };
    }
}
