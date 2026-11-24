package com.acme.shop.flags;

import com.acme.shop.logging.AppLogger;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class FeatureFlags {
    private static final AppLogger log = AppLogger.of(FeatureFlags.class);
    private final FeatureProperties properties;

    public FeatureFlags(FeatureProperties properties) {
        this.properties = properties;
    }

    public boolean isEnabled(String name) {
        boolean value = properties.features().getOrDefault(name, false);
        log.info("flag_evaluated", Map.of("flag", name, "value", value));
        return value;
    }
}
