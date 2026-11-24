package com.acme.shop.flags;

import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app")
public record FeatureProperties(Map<String, Boolean> features) {
    public FeatureProperties {
        features = features == null ? Map.of() : Map.copyOf(features);
    }
}
