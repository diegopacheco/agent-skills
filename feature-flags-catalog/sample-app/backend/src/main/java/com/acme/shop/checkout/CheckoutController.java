package com.acme.shop.checkout;

import com.acme.shop.flags.FeatureFlags;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CheckoutController {
    private final FeatureFlags flags;

    public CheckoutController(FeatureFlags flags) {
        this.flags = flags;
    }

    @GetMapping("/api/checkout/mode")
    public Map<String, String> mode() {
        return Map.of("mode", flags.isEnabled("fast-checkout") ? "fast" : "standard");
    }
}
