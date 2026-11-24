package com.acme.shop.catalog;

import java.math.BigDecimal;

public record PricedProduct(String id, String name, BigDecimal listPrice, BigDecimal price, String engine, boolean regional) {
}
