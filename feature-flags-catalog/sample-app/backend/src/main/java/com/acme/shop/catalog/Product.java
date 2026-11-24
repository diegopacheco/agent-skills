package com.acme.shop.catalog;

import java.math.BigDecimal;

public record Product(String id, String name, BigDecimal price) {
}
