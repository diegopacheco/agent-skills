package com.acme.shop.export;

public class ExportDisabled extends RuntimeException {
    public ExportDisabled() {
        super("bulk export is turned off");
    }
}
