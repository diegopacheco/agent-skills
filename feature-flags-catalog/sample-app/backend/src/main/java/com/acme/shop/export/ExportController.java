package com.acme.shop.export;

import com.acme.shop.catalog.ProductCatalog;
import com.acme.shop.flags.FeatureFlags;
import java.util.stream.Collectors;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExportController {
    private final ProductCatalog catalog;
    private final FeatureFlags flags;

    public ExportController(ProductCatalog catalog, FeatureFlags flags) {
        this.catalog = catalog;
        this.flags = flags;
    }

    @GetMapping(value = "/api/export", produces = MediaType.TEXT_PLAIN_VALUE)
    public String export() {
        if (!flags.isEnabled("bulk-export")) {
            throw new ExportDisabled();
        }
        return catalog.all().stream().map(p -> p.id() + "," + p.name() + "," + p.price()).collect(Collectors.joining("\n"));
    }
}
