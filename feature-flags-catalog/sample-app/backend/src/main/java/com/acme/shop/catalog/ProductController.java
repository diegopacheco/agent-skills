package com.acme.shop.catalog;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final PricingService pricing;

    public ProductController(PricingService pricing) {
        this.pricing = pricing;
    }

    @GetMapping
    public List<PricedProduct> list(@RequestParam(defaultValue = "eu") String region) {
        return pricing.priced(region);
    }
}
