package com.acme.shop.logging;

public final class CorrelationId {
    public static final String HEADER = "X-Correlation-Id";
    public static final String KEY = "correlationId";

    private CorrelationId() {
    }
}
