package com.acme.shop.catalog;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ProductCatalog {
    private final List<Product> products = List.of(
            new Product("p-1", "Mechanical keyboard", new BigDecimal("120.00")),
            new Product("p-2", "4K monitor", new BigDecimal("399.00")),
            new Product("p-3", "Noise cancelling headphones", new BigDecimal("249.00")),
            new Product("p-4", "USB-C dock", new BigDecimal("89.00")));

    public List<Product> all() {
        return products;
    }
}
